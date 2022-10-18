import { verify } from 'jsonwebtoken'
import jwksClient, { CertSigningKey, RsaSigningKey } from 'jwks-rsa'
import createAuth0Mock from './index'
import pify from 'pify'

const auth0Mock = createAuth0Mock('https://hardfork.eu.auth0.com')
const client = jwksClient({
  jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json',
})

describe('Tests for JWKS being correctly consumed by jwks-rsa client', () => {
  beforeEach(() => {
    auth0Mock.start()
  })
  afterEach(() => {
    auth0Mock.stop()
  })
  test('mock returns a signing key', () =>
    expect(pify(client.getSigningKey)(auth0Mock.kid())).resolves.toBeTruthy())
  test('generated token should be valid against the JWKS key', async () => {
    const key = await pify(client.getSigningKey)(auth0Mock.kid())
    const signingKey = String(
      (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey
    )
    expect(verify(auth0Mock.token({}), signingKey)).toBeTruthy()
  })
  test('iat and exp are numbers', async () => {
    const key = await pify(client.getSigningKey)(auth0Mock.kid())
    const signingKey = String(
      (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey
    )
    expect(() =>
      // @ts-expect-error types should prevent using a string for iat
      verify(auth0Mock.token({ iat: '123' }), signingKey)
    ).toThrowError('iat')
    expect(() =>
      // @ts-expect-error types should prevent using a string for exp
      verify(auth0Mock.token({ exp: '123' }), signingKey)
    ).toThrowError('exp')
    expect(() =>
      verify(auth0Mock.token({ iat: 123, exp: 64779973980000 }), signingKey)
    ).not.toThrow()
  })
})
