const createJWKSMock = require('../../index').default
const createApp = require('../api')
const supertest = require('supertest')
const test = require('tape')

test('Some tests for authentication for our api', (t) => {
  t.test('should not get access without correct token', async (assert) => {
    assert.plan(1)
    const { jwksMock, server, request } = createContext()
    // We start intercepting queries (see below)
    jwksMock.start()
    const { status } = await request.get('/')
    await tearDown({ jwksMock, server })
    assert.equal(status, 401)
  })
  t.test(
    'should get access with mock token when jwksMock is running',
    async (assert) => {
      assert.plan(1)
      const { jwksMock, request, server } = createContext()
      // Again we start intercepting queries
      jwksMock.start()
      const access_token = jwksMock.token({
        aud: 'private',
        iss: 'master',
      })
      const { status } = await request
        .get('/')
        .set('Authorization', `Bearer ${access_token}`)
      await tearDown({ jwksMock, server })
      assert.equal(status, 200)
    }
  )
  t.test(
    'should not get access with mock token when jwksMock is not running',
    async (assert) => {
      assert.plan(1)
      const { jwksMock, server, request } = createContext()
      // Now we do not intercept queries. The queries of the middleware for the JKWS will
      // go to the production server and the local key will be invalid.
      const access_token = jwksMock.token({
        aud: 'private',
        iss: 'master',
      })
      const { status } = await request
        .get('/')
        .set('Authorization', `Bearer ${access_token}`)
      await tearDown({ jwksMock, server })
      assert.equal(status, 401)
    }
  )
  t.test('Another example with a non-auth0-style jkwsUri', async (assert) => {
    assert.plan(1)
    const jwksMock = createJWKSMock(
      'https://hardfork.eu.auth0.com',
      '/protocol/openid-connect/certs'
    )
    // We start our app.
    const server = createApp({
      jwksUri: 'https://hardfork.eu.auth0.com/protocol/openid-connect/certs',
    }).listen()

    const request = supertest(server)

    jwksMock.start()
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })
    const { status } = await request
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)
    await tearDown({ jwksMock, server })
    assert.equal(status, 200)
  })
})

const createContext = () => {
  // This creates the local PKI
  const jwksMock = createJWKSMock('https://hardfork.eu.auth0.com/')

  // We start our app.
  const server = createApp({
    jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json',
  }).listen()

  const request = supertest(server)
  return {
    jwksMock,
    request,
    server,
  }
}

const tearDown = async ({ jwksMock, server }) => {
  await server.close()
  await jwksMock.stop()
}
