import JWT from 'jsonwebtoken'
import jwksClient, { CertSigningKey, RsaSigningKey } from 'jwks-rsa'
import createAuth0Mock, { type JWKSMock } from './index.js'
import pify from 'pify'
import { beforeEach, describe, expect, test } from 'vitest'
import { setupServer } from 'msw/node'

const initialise = () => {
  const auth0Mock = createAuth0Mock('https://hardfork.eu.auth0.com')
  const client = jwksClient({
    jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json',
  })
  return { auth0Mock, client }
}

const rsaClientTests = (auth0Mock: JWKSMock, client: jwksClient.JwksClient) => {
  test('mock returns a signing key', () =>
    expect(pify(client.getSigningKey)(auth0Mock.kid())).resolves.toBeTruthy())
  test('generated token should be valid against the JWKS key', async () => {
    const key = await pify(client.getSigningKey)(auth0Mock.kid())
    const signingKey = String(
      (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey
    )
    expect(JWT.verify(auth0Mock.token({}), signingKey)).toBeTruthy()
  })
  test('iat and exp are numbers', async () => {
    const key = await pify(client.getSigningKey)(auth0Mock.kid())
    const signingKey = String(
      (key as CertSigningKey).publicKey || (key as RsaSigningKey).rsaPublicKey
    )
    expect(() =>
      // @ts-expect-error types should prevent using a string for iat
      JWT.verify(auth0Mock.token({ iat: '123' }), signingKey)
    ).toThrowError('iat')
    expect(() =>
      // @ts-expect-error types should prevent using a string for exp
      JWT.verify(auth0Mock.token({ exp: '123' }), signingKey)
    ).toThrowError('exp')
    expect(() =>
      JWT.verify(auth0Mock.token({ iat: 123, exp: 64779973980000 }), signingKey)
    ).not.toThrow()
  })
  test('token payload is correctly encoded', () =>
    expect(
      JWT.decode(
        auth0Mock.token({
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
          roles: ['admin'],
          permissions: [
            'create:all',
            'read:all',
            'write:all',
            'update:all',
            'delete:all',
          ],
        })
      )
    ).toEqual({
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
      roles: ['admin'],
      permissions: [
        'create:all',
        'read:all',
        'write:all',
        'update:all',
        'delete:all',
      ],
    }))
}

describe('Tests for JWKS being correctly consumed by jwks-rsa client', () => {
  describe('Using built-in msw server mocks', () => {
    const { auth0Mock, client } = initialise()

    beforeEach(() => {
      auth0Mock.start()
      return auth0Mock.stop
    })

    rsaClientTests(auth0Mock, client)
  })

  describe('Using custom msw server mocks', () => {
    const { auth0Mock, client } = initialise()

    beforeEach(() => {
      const server = setupServer(auth0Mock.jwksHandler())
      server.listen()
      return () => server.close()
    })

    rsaClientTests(auth0Mock, client)
  })
})
