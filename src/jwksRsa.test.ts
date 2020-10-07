import { verify } from 'jsonwebtoken'
import jwksClient, { CertSigningKey, RsaSigningKey } from 'jwks-rsa'
import createAuth0Mock from './index'
import { assert } from './chai'
import pify from 'pify'
describe('Tests for JWKS being correctly consumed by jwks-rsa client', () => {
  const auth0Mock = createAuth0Mock('https://hardfork.eu.auth0.com')
  const client = jwksClient({
    jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json',
    strictSsl: true, // Default value
  })
  beforeEach(() => {
    auth0Mock.start()
  })
  afterEach(() => {
    auth0Mock.stop()
  })
  test('should get the correct key from the jwks endpoint', async () => {
    const kid = auth0Mock.kid()
    await assert.isFulfilled(
      pify(client.getSigningKey)(kid),
      'Should be able to get the signing key without errors'
    )
  })
  test('should verify a token with the public key from the JWKS', async () => {
    const kid = auth0Mock.kid()
    const key = await pify(client.getSigningKey)(kid)
    const signingKey = String(
      (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey
    )
    assert.ok(
      verify(auth0Mock.token({}), signingKey),
      'Signing key should be valid for the created token'
    )
  })
})
