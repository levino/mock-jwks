import { createCertificate, createJWKS, createKeyPair } from '../tools'
import { pki } from 'node-forge'

describe('Testing the private key creation for mocking', () => {
  it('should create a private key', () => {
    expect(createKeyPair()).toBeDefined()
  })
  it('should create a signed certificate from a keypair', () => {
    const keypair = createKeyPair()
    expect(createCertificate(keypair)).toBeDefined()
  })
  it('should create a JWKS from a keypair', () => {
    const keypair = createKeyPair()
    expect(createJWKS(keypair)).toBeDefined()
  })
})
