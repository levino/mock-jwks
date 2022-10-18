import { verify } from 'jsonwebtoken'
import { pki } from 'node-forge'
import { createKeyPair, signJwt } from './tools'

test("'Token should verify against the PKI'", async () => {
  const keyPair = createKeyPair()

  // demonstrate use of claims built by actions or features which are enabled in the app/API setup in AUTH0, including:
  // inclusion of roles and permissions
  // use of namespaced roles
  const claims = {
    nickname: 'jest.jester',
    name: 'jest@itest.com',
    updated_at: '2022-10-09T11:36:37.582Z',
    email: 'jest@itest.com',
    iss: 'https://jest.au.auth0.com/',
    sub: 'auth0|633c191bd579670011607e98',
    aud: 'TWqR7DTIezpfW82qXFt0lchMXixIpFLQ',
    iat: 1665315399,
    exp: 5665351399,
    sid: 'lBZb4EUN7LpXu7Urp-lRQ3qnCzDVBf23',
    nonce: 'RzZtVlVTT1dqZ1lvWFpSYzFnbnB2RXZkdWcuNDJQRkREUH5KMUVJNWdMSA==',
    'https://jest.au.auth0.com/roles': ['admin'],
    permissions: [
      'create:all',
      'read:all',
      'write:all',
      'update:all',
      'delete:all',
    ],
  }

  const token = signJwt(keyPair.privateKey, claims)
  const decoded = verify(
    token,
    pki.publicKeyToPem(keyPair.publicKey)
  ) as Record<string, unknown>

  const namespaced_roles = decoded[
    'https://jest.au.auth0.com/roles'
  ] as string[]
  const permissions = decoded['permissions'] as string[]

  expect(decoded).toBeTruthy()

  expect(namespaced_roles).toBeTruthy()
  expect(namespaced_roles.indexOf('admin')).toBeGreaterThanOrEqual(0)

  expect(permissions).toBeTruthy()
  expect(permissions.indexOf('create:all')).toBeGreaterThanOrEqual(0)
})
