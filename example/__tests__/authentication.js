const createJWKSMock = require('../../index').default
const createApp = require('../api')
const supertest = require('supertest')

let server
let request
let jwksMock

describe('Some tests for authentication for our api', () => {
  beforeEach(async () => {
    // This creates the local PKI
    jwksMock = createJWKSMock('https://hardfork.eu.auth0.com')

    // We start our app.
    server = await createApp({
      jwksHost: 'https://hardfork.eu.auth0.com'
    }).listen()

    request = supertest(server)
  })
  afterEach(async () => {
    //This is just to avoid side effects between the tests.
    await server.close()
    await jwksMock.stop()
  })
  it('should not get access without correct token', async () => {
    // We start intercepting queries (see below)
    jwksMock.start()
    await request.get('/').expect(401)
  })
  it('should get access with mock token when jwksMock is running', async () => {
    // Again we start intercepting queries
    jwksMock.start()
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(200)
  })
  it('should not get access with mock token when jwksMock is not running', async () => {
    // Now we do not intercept queries. The queries of the middleware for the JKWS will
    // go to the production server and the local key will be invalid.
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(401)
  })
})
