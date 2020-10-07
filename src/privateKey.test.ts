import { createCertificate, createJWKS, createKeyPair } from './tools'
import { assert } from 'chai'

// TODO: Remove these pointless tests
test('Private key creation for mocking', () => {
  assert.ok(createKeyPair(), 'Keypair is truthy')
  assert.ok(
    createCertificate(createKeyPair()),
    'Certificate from keypair is truthy'
  )
  assert.ok(createJWKS(createKeyPair()), 'JWKS from keypair is truthy')
})
