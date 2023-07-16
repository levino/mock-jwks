import { createJWKS, createKeyPair } from './tools.js'

describe('JWKS', () => {
  test("'Exponent is correctly encoded'", () => {
    const keypair = createKeyPair()
    const jwks = createJWKS({
      ...keypair,
    })
    expect(jwks.keys[0].e).toEqual('AQAB')
  })
})
