// @ts-check
/**
 * @typedef
 */
import createJWKSMock from 'mock-jwks'
import { createApp } from './api.js'
import supertest from 'supertest'
import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { setupServer } from 'msw/node'

const jwksMock = createJWKSMock('https://levino.eu.auth0.com')
const app = createApp({
  jwksUri: 'https://levino.eu.auth0.com/.well-known/jwks.json',
})

describe('Some tests for authentication for our api', () => {
  /** @type {import('msw/node').SetupServerApi} */
  let mswServer
  beforeAll(() => {
    mswServer = setupServer()
    mswServer.listen({
      onUnhandledRequest: 'bypass', // We silence the warnings of msw for unhandled requests. Not necessary for things to work.
    })
    return () => mswServer.close()
  })

  beforeEach(() => {
    mswServer.resetHandlers()
  })

  test('Can get access with mock token when handler is attached to msw', async () => {
    // arrange
    mswServer.use(jwksMock.mswHandler)
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })

    // act
    const { status } = await supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)

    // assert
    expect(status).toEqual(200)
  })
  test('Cannot get access with mock token when handler is not attached to msw', async () => {
    // Now we do not intercept queries. The queries of the middleware for the JKWS will
    // go to the production server and the local key will be invalid.
    // arrange
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })

    // act
    const { status } = await supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)

    // assert
    expect(status).toEqual(500)
  })
})
