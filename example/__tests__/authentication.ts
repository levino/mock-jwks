import createJWKSMock from '../../index'
import createApp from '../api'
import * as supertest from 'supertest'

let server
let request
let jwksMock

describe('Some tests for authentication for our api', () => {
  beforeEach(async () => {
    jwksMock = createJWKSMock('https://hardfork.eu.auth0.com')
    server = await createApp({
      jwksHost: 'https://hardfork.eu.auth0.com'
    }).listen()
    request = supertest(server)
  })
  afterEach(async () => {
    await server.close()
    await jwksMock.stop()
  })
  it('should not get acces without correct token', async () => {
    jwksMock.start()
    await request.get('/').expect(401)
  })
  it('should get access with mock token when auth0Mock is running', async () => {
    jwksMock.start()
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(200)
  })
  it('should not get access with mock token when auth0Mock is not running', async () => {
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(401)
  })
})
