import { verify } from 'jsonwebtoken'
import { pki } from 'node-forge'
import { createKeyPair, signJwt } from './tools'

describe('jwt creation', () => {
  let privateKey: pki.rsa.PrivateKey, publicKey: pki.rsa.PublicKey
  beforeEach(() => ({ privateKey, publicKey } = createKeyPair()))
  test('created tokens are valid in the PKI', () =>
    expect(
      verify(
        signJwt(privateKey, {
          iss: 'SOMETHING',
        }),
        pki.publicKeyToPem(publicKey)
      )
    ).toBeTruthy())
})
