import { verify, decode } from 'jsonwebtoken'
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
  test('token payload is correctly encoded', () =>
    expect(
      decode(
        auth0Mock.token({
          nickname: 'jest.jester',
          name: 'jest@itest.com',
          updated_at: '2022-10-09T11:36:37.582Z',
          email: 'jest@itest.com',
          iss: 'https://jest.au.auth0.com/',
          sub: 'auth0|633c191bd579670011607e98',
          aud: 'TWqR7DTIezpfW82qXFt0lchMXixIpFLQ',
          iat: 1665315399,
          exp: 5665351399,
          sid: 'lBZb4EUN7LpXu7Urp-lRQ3qnCzDVBf23',
          nonce: 'RzZtVlVTT1dqZ1lvWFpSYzFnbnB2RXZkdWcuNDJQRkREUH5KMUVJNWdMSA==',
          roles: ['admin'],
          permissions: [
            'create:all',
            'read:all',
            'write:all',
            'update:all',
            'delete:all',
          ],
        })
      )
    ).toEqual({
      nickname: 'jest.jester',
      name: 'jest@itest.com',
      updated_at: '2022-10-09T11:36:37.582Z',
      email: 'jest@itest.com',
      iss: 'https://jest.au.auth0.com/',
      sub: 'auth0|633c191bd579670011607e98',
      aud: 'TWqR7DTIezpfW82qXFt0lchMXixIpFLQ',
      iat: 1665315399,
      exp: 5665351399,
      sid: 'lBZb4EUN7LpXu7Urp-lRQ3qnCzDVBf23',
      nonce: 'RzZtVlVTT1dqZ1lvWFpSYzFnbnB2RXZkdWcuNDJQRkREUH5KMUVJNWdMSA==',
      roles: ['admin'],
      permissions: [
        'create:all',
        'read:all',
        'write:all',
        'update:all',
        'delete:all',
      ],
    }))
})
