import createAuth0Mock from '../../index'
import createApp from '../api'
import * as supertest from 'supertest'

let server
let request
let auth0Mock

describe('Some tests for authentication for our api', () => {
  beforeAll(() => {
    server = createApp({
      jwksHost: 'https://hardfork.eu.auth0.com'
    }).listen()
    auth0Mock = createAuth0Mock()
    auth0Mock.start()
    request = supertest(server)
  })
  afterAll(() => {
    server.close()
  })
  it('should not get acces without correct token', async () => {
    return request.get('/').expect(401)
  })
  it('should get access with correct token', async () => {
    const access_token = auth0Mock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(200)
  })
})
