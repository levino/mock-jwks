import * as JWT from 'jsonwebtoken'
import forge from 'node-forge'
import { beforeEach, describe, expect, test } from 'vitest'
import { createKeyPair, signJwt } from './tools.js'

describe('jwt creation', () => {
  let privateKey: forge.pki.rsa.PrivateKey
  let publicKey: forge.pki.rsa.PublicKey
  beforeEach(() => {
    ;({ privateKey, publicKey } = createKeyPair())
  })
  test('created tokens are valid in the PKI', () =>
    expect(
      JWT.verify(
        signJwt(privateKey, {
          iss: 'SOMETHING',
        }),
        forge.pki.publicKeyToPem(publicKey)
      )
    ).toBeTruthy())
})
