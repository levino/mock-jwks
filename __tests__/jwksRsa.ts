import createAuth0Mock from '../index'
import * as jwksClient from 'jwks-rsa'
import { sign, verify } from 'jsonwebtoken'

describe('Some Test', () => {
  const auth0Mock = createAuth0Mock()
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
    client.getSigningKey(kid, (err, key) => {
      if (err) {
        return done(err)
      }
      const signingKey = key.publicKey || key.rsaPublicKey
      console.log(signingKey)
      // Now I can use this to configure my Express or Hapi middleware
      done()
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
      // Now I can use this to configure my Express or Hapi middleware
      done()
    })
  })
})
