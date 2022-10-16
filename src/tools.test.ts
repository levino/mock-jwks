import { createJWKS, createKeyPair } from './tools'

describe('JWKS', () => {
  test("'Exponent is correctly encoded'", () => {
    const keypair = createKeyPair()
    const jwks = createJWKS({
      ...keypair,
    })
    expect(jwks.keys[0].e).toEqual('AQAB')
  })
})
