const createJWKSMock = require('../src/index').default
const createApp = require('./api')
const supertest = require('supertest')
const { access } = require('fs')

describe('Some tests for authentication for our api', () => {
  let jwksMock, server, request
  beforeEach(() => {
    ({ jwksMock, server, request } = createContext())
  })
  afterEach(async () => await tearDown({ jwksMock, server }))

  test('should not get access without correct token', async () => {
    // We start intercepting queries (see below)
    jwksMock.start()
    const { status } = await request.get('/')
    expect(status).toEqual(401)
  })
  test('should get access with mock token when jwksMock is running', async () => {
    // Again we start intercepting queries
    jwksMock.start()
      
    const claims = {
      nickname: "jest.jester",
      name: "jest@itest.com",
      updated_at: "2022-10-09T11:36:37.582Z",
      email: "jest@itest.com",
      iss: "master",
      sub: "auth0|633c191bd579670011607e98",
      aud: "private",
      iat: 1665315399,
      exp: 5665351399,
      sid: "lBZb4EUN7LpXu7Urp-lRQ3qnCzDVBf23",
      nonce: "RzZtVlVTT1dqZ1lvWFpSYzFnbnB2RXZkdWcuNDJQRkREUH5KMUVJNWdMSA==",
      roles: [
        "admin",
      ],
      permissions: [
        "create:all",
        "read:all",
        "write:all",
        "update:all",
        "delete:all",
      ],
    } 

    const access_token = jwksMock.token(claims)

    const { status } = await request
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
    const { status } = await request
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)
    expect(status).toEqual(401)
  })
})

test('Another example with a non-auth0-style jkwsUri', async () => {
  const jwksMock = createJWKSMock(
    'https://keycloak.somedomain.com/auth/realm/application',
    '/protocol/openid-connect/certs'
  )
  // We start our app.
  const server = createApp({
    jwksUri:
      'https://keycloak.somedomain.com/auth/realm/application/protocol/openid-connect/certs',
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
  expect(status).toEqual(200)
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
