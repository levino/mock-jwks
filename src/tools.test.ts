import { describe, expect, test } from 'vitest'
import { createJWKS, createKeyPair } from './tools.js'

describe('JWKS', () => {
  test("'Exponent is correctly encoded'", () => {
    const keypair = createKeyPair()
    const jwks = createJWKS({
      ...keypair,
    })
    expect(jwks.keys[0].e).toEqual('AQAB')
  })
  test('Modulus is encoded as in previous releases', () => {
    const jwks = createJWKS(createKeyPair())
    expect(jwks.keys[0].n).toEqual(
      'AKaKHKTt221BeqPHsiZUAn8C2oRLLp1nVRfvsjhMiruC6dY9Jto/z+4hzrcQQJI3TNl9qFt6jtZkdLCBXn6p5vd4NKtp0bmBKEvlt6Ol+dMIzlZvH6/7S6hC88uQaBE9AEJewMadQzbG9BzTgXKCAbfsVWOCPpOrlySSTM24L2oQIEi2fUVtGdFk/nQh2aWVI9Jy8TVyD3XIuuQcOiKIJ6lxz+gMCmV6U+ows486vbsh8VXLnasOo9JEMOPPwOQOgDeXyFctXCp3dLCnakV9TVKlaIjqzuI2gwdSHSw/mJkRPyYzh7FiDBJWAj8Sqp7DaOlQrJRl/84opwKx4akQax8='
    )
  })
})
