import { signJwt, createKeyPair } from '../tools'
import { verify } from 'jsonwebtoken'
import { pki } from 'node-forge'

describe('Tests for jwt creation', () => {
  it('should sign a jwt', () => {
    const keyPair = createKeyPair()
    const jwtPayload = {
      iss: 'SOMETHING',
    }
    const token = signJwt(keyPair.privateKey, jwtPayload)
    expect(token).toBeDefined()
    expect(verify(token, pki.publicKeyToPem(keyPair.publicKey))).toBeTruthy()
  })
})
