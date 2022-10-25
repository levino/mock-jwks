# mock-jwks

A tool to mock a JWKS authentication service for development of microservices CONSUMING authentication and authorization jwts.

## Background

If you use jtws for authentication and authorization of your users against your microservices, you want to automatically unit
test the authentication in your microservice for security. Happy and unhappy paths. Doing this while actually using a running JWKS
deployment (like the auth0 backend) is slow and annoying, so e.g. auth0 suggest you mock their api. This turns out to be
somewhat difficult, especially in the case of using RSA for signing of the tokens and not wanting to heavily dependency inject the middleware for
authentication in your koa or express app. This is why I made this tool, which requires less changes to your code.

## Usage

Lets say you have a pretty standard koa app (I use a factory function to make the app, so I can scope nicely):

```js
// File index.js
const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('koa-jwt')
const jwksRsa = require('jwks-rsa')

const createApp = ({ jwksUri }) => {
  const app = new Koa()

  // We set up the jwksRsa client as usual (with production host)
  // We switch off caching to show how things work in ours tests.

  app.use(
    jwt({
      secret: jwksRsa.koaJwtSecret({
        cache: false,
        jwksUri,
      }),
      audience: 'private',
      issuer: 'master',
      algorithms: ['RS256'],
    })
  )

  const router = new Router()

  // This route is protected by the authentication middleware
  router.get('/', (ctx) => {
    ctx.body = 'Authenticated!'
  })

  app.use(router.middleware())
  return app
}

module.exports = createApp
```

You can easily unit test the authentication of this app like so:

```js
// File index.test.js
const createJWKSMock = require('../src/index').default
const createApp = require('./api')
const supertest = require('supertest')
const { assert } = require('chai')

describe('Some tests for authentication for our api', () => {
  let jwksMock, server, request
  beforeEach(() => {
    ;({ jwksMock, server, request } = createContext())
  })
  afterEach(async () => await tearDown({ jwksMock, server }))

  test('should not get access without correct token', async () => {
    // We start intercepting queries (see below)
    jwksMock.start()
    const { status } = await request.get('/')
    assert.equal(status, 401)
  })
  test('should get access with mock token when jwksMock is running', async () => {
    // Again we start intercepting queries
    jwksMock.start()
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })
    const { status } = await request
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)
    assert.equal(status, 200)
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
    assert.equal(status, 401)
  })
})

test('Another example with a non-auth0-style jkwsUri', async () => {
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
```

See also the [example](example/).

## Under the hood

`createJWKSMock` will create a local PKI and generate a working JWKS.json. Calling `jwksMock.start()` will use [nock](https://www.npmjs.com/package/nock)
to intercept all calls to `` `${ jwksOrigin }${ jwksPath || '/.well-known/jwks.json' }` ``. So when the `jwks-rsa` middleware gets a token to validate
it will fetch the key to verify against from our local PKI instead of the production one and as such, the token is valid
when signed with the local private key.

## Contributing

You found a bug or want to improve the software? Thank you for your support! Before you open a PR I kindly invite you to read about [best practices](https://eli.thegreenplace.net/2019/how-to-send-good-pull-requests-on-github/) and subject your contribution to them.
