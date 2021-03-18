import { createJWKS, createKeyPair } from './tools'
import { assert } from 'chai'

describe('JWKS', () => {
  test('JWKS values', () => {
    const keypair = createKeyPair()
    const jwks = createJWKS({
      ...keypair,
    })
    assert.equal(jwks.keys[0].e, 'AQAB', 'Exponent is correctly encoded')
  })
})
