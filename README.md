# mock-auth0
A tool to mock the auth0 authentication service for development of microservices CONSUMING auth0 jwts

## Background
If you use auth0 for authentication and authorization of your users against your microservices, you want to automatically unit
test the authentication in your microservice for security. Happy and unhappy paths. Doing this while actually using the
auth0 backend is slow and annoying, so auth0 suggest you mock their api. This turns out to be somewhat difficult, especially
in the case of using RSA for signing of the tokens and not wanting to heavily dependency inject the middleware for
authentication in your koa or express app. This is why I made this tool, which require less changes to your code.

## Usage

Lets say you have a pretty standard koa app (I use a factory function to make the app, so I can scope nicely):

```js
const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('koa-jwt')
const jwksRsa = require('jwks-rsa')

const createApp = ({ jwksHost }) => {
  const app = new Koa()

  // We are setting up the jwksRsa client as usual (with production host)
  // We switch off caching to show how things work in ours tests.

  app.use(
    jwt({
      secret: jwksRsa.koaJwtSecret({
        cache: false,
        jwksUri: `${jwksHost}/.well-known/jwks.json`
      }),
      audience: 'private',
      issuer: 'master',
      algorithms: ['RS256']
    })
  )

  const router = new Router()

  // This route is protected by the authentication middleware
  router.get('/', ctx => {
    ctx.body = 'Authenticated!'
  })

  app.use(router.middleware())
  return app
}

export default createApp

```

You can easily unit test the authenticaion  of this app like so:

```js
import createAuth0Mock from '../../index'
import createApp from '../api'
import * as supertest from 'supertest'

let server
let request
let auth0Mock

describe('Some tests for authentication for our api', () => {
  beforeEach(async () => {
    // This creates the local PKI
    auth0Mock = createAuth0Mock('https://hardfork.eu.auth0.com')

    // We start our app.
    server = await createApp({
      jwksHost: 'https://hardfork.eu.auth0.com'
    }).listen()

    request = supertest(server)
  })
  afterEach(async () => {
    //This is just to avoid side effects between the tests.
    await server.close()
    await auth0Mock.stop()
  })
  it('should not get acces without correct token', async () => {
    // We start intercepting queries (see below)
    auth0Mock.start()
    await request.get('/').expect(401)
  })
  it('should get access with mock token when auth0Mock is running', async () => {
    // Again we start intercepting queries
    auth0Mock.start()
    const access_token = auth0Mock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(200)
  })
  it('should not get access with mock token when auth0Mock is not running', async () => {
    // Now we do not intercept queries. The queries of the middleware for the JKWS will
    // go to the production server and the local key will be invalid.
    const access_token = auth0Mock.token({
      aud: 'private',
      iss: 'master'
    })
    await request.get('/').set('Authorization' , `Bearer ${access_token}`).expect(401)
  })
})

```

See also the [example](example/).

## Under the hood

`createAuth0Mock` will create a local PKI and generate a working JWKS.json. Calling `auth0Mock.start()` will use [nock](https://www.npmjs.com/package/nock)
to intercept all calls to `` `${jwksHost}/.well-known/jwks.json` ``.  So when the `jwks-rsa` middleware gets a token to validate
it will fetch the key to verify against from our local PKI instead of the production one and as such, the token is valid
when signed with the local private key.


