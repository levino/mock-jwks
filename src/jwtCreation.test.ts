import { verify } from 'jsonwebtoken'
import { pki } from 'node-forge'
import { createKeyPair, signJwt } from './tools'
import { assert } from 'chai'

test('Jwt creation', async () => {
  const keyPair = createKeyPair()
  const jwtPayload = {
    iss: 'SOMETHING',
  }
  const token = signJwt(keyPair.privateKey, jwtPayload)
  assert.ok(token, 'Returned token should be truthy')
  assert.ok(
    verify(token, pki.publicKeyToPem(keyPair.publicKey)),
    'Token should verify against the PKI'
  )
})
