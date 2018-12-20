import { verify } from 'jsonwebtoken'
import { pki } from 'node-forge'
import test from 'tape'
import { createKeyPair, signJwt } from '../tools'
test('Tests for jwt creation', (t) => {
  t.test('should sign a jwt', (assert) => {
    assert.plan(2)
    const keyPair = createKeyPair()
    const jwtPayload = {
      iss: 'SOMETHING',
    }
    const token = signJwt(keyPair.privateKey, jwtPayload)
    assert.ok(token)
    assert.ok(verify(token, pki.publicKeyToPem(keyPair.publicKey)))
  })
})
