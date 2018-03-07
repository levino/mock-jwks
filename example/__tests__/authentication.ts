import createAuth0Mock from '../../index'
import createApp from '../api'
import * as supertest from 'supertest'
import * as superagent from 'superagent'

let server
let request
let auth0Mock

describe('Some tests for authentication for our api', () => {
  beforeEach(async () => {
    auth0Mock = createAuth0Mock('https://hardfork.eu.auth0.com')
    server = await createApp({
      jwksHost: 'https://hardfork.eu.auth0.com'
    }).listen()
    request = supertest(server)
  })
  afterEach(async () => {
    await server.close()
    await auth0Mock.stop()
  })
  it('should not get acces without correct token', async () => {
    auth0Mock.start()
    await request.get('/').expect(401)
  })
  it('should get access with mock token when auth0Mock is running', async () => {
    auth0Mock.start()
    const access_token = auth0Mock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(200)
  })
  it('should not get access with mock token when auth0Mock is not running', async () => {
    const access_token = auth0Mock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(401)
  })
})
