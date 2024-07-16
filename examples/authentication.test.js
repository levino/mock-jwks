// @ts-check
import { createJWKSMock } from 'mock-jwks'
import { createApp } from './api.js'
import supertest from 'supertest'
import { describe, expect, test, onTestFinished } from 'vitest'

// This creates the local PKI
const jwksMock = createJWKSMock('https://levino.eu.auth0.com')
// We start our app.
const app = createApp({
  jwksUri: 'https://levino.eu.auth0.com/.well-known/jwks.json',
})

describe('Some tests for authentication for our api', () => {
  test('should not get access without correct token', async () => {
    // We start intercepting queries (see below)
    onTestFinished(jwksMock.start())
    const { status } = await supertest(app).get('/')
    expect(status).toEqual(401)
  })

  test('should get access with mock token when jwksMock is running', async () => {
    // Again we start intercepting queries
    onTestFinished(jwksMock.start())
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })
    const { status } = await supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)
    expect(status).toEqual(200)
  })
  test('should not get access with mock token when jwksMock is not running', async () => {
    // Now we do not intercept queries. The queries of the middleware for the JKWS will
    // go to the production server and the local key will be invalid.
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })
    const { status } = await supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)
    expect(status).toEqual(500)
  })
})
test('Another example with a non-auth0-style jkwsUri', async () => {
  const jwksMock = createJWKSMock(
    'https://keycloak.somedomain.com',
    '/auth/realm/application/protocol/openid-connect/certs'
  )
  // We start our app.
  const app = createApp({
    jwksUri:
      'https://keycloak.somedomain.com/auth/realm/application/protocol/openid-connect/certs',
  })
  const request = supertest(app)
  onTestFinished(jwksMock.start())
  const access_token = jwksMock.token({
    aud: 'private',
    iss: 'master',
  })
  const { status } = await request
    .get('/')
    .set('Authorization', `Bearer ${access_token}`)
  expect(status).toEqual(200)
})
