import { verify } from 'jsonwebtoken'
import { pki } from 'node-forge'
import { createKeyPair, signJwt } from './tools'

test("'Token should verify against the PKI'", async () => {
  const keyPair = createKeyPair()
  const jwtPayload = {
    iss: 'SOMETHING',
  }
  const token = signJwt(keyPair.privateKey, jwtPayload)
  expect(verify(token, pki.publicKeyToPem(keyPair.publicKey))).toBeTruthy()
})
