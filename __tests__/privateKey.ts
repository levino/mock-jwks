import test from 'tape'
import { createCertificate, createJWKS, createKeyPair } from '../tools'

test('Testing the private key creation for mocking', (t) => {
  t.test('should create a private key', (assert) => {
    assert.plan(1)
    assert.ok(createKeyPair())
  })
  t.test('should create a signed certificate from a keypair', (assert) => {
    assert.plan(1)
    const keypair = createKeyPair()
    assert.ok(createCertificate(keypair))
  })
  t.test('should create a JWKS from a keypair', (assert) => {
    assert.plan(1)
    const keypair = createKeyPair()
    assert.ok(createJWKS(keypair))
  })
})
