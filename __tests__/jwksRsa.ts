import createAuth0Mock from '../index'
import * as jwksClient from 'jwks-rsa'
import { verify } from 'jsonwebtoken'

describe('Tests for JWKS being correctly consumed by jwks-rsa client', () => {
  const auth0Mock = createAuth0Mock('https://hardfork.eu.auth0.com')
  beforeEach(() => {
    auth0Mock.start()
  })
  afterEach(() => {
    auth0Mock.stop()
  })
  it('should get the correct key from the jwks endpoint', (done) => {
    const client = jwksClient({
      strictSsl: true, // Default value
      jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json'
    })

    const kid = auth0Mock.kid()
    client.getSigningKey(kid, (err) => {
      return done(err)
    })
  })
  it('should verify a token with the public key from the JWKS', (done) => {
    const client = jwksClient({
      strictSsl: true, // Default value
      jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json'
    })

    const kid = auth0Mock.kid()
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        return done(err)
      }
      const signingKey = key.publicKey || key.rsaPublicKey
      try {
        verify(auth0Mock.token(), signingKey)
      } catch (err) {
        return done(err)
      }
      done()
    })
  })
})
