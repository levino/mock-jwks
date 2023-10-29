# mock-jwks

A tool to mock a JWKS authentication service for development of microservices CONSUMING authentication and authorization jwts.

## Breaking changes

As of version 2 and march 2023 this package is a [pure esm package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). I made an [example](https://github.com/levino/use-mock-jwks/tree/4fd1622af213006dc7be32902273621bbe7aff3e) on how to use the module. Use version 1 for a commonjs version.

## Background

If you use jwts for authentication and authorization of your users against your microservices, you want to automatically unit
test the authentication in your microservice for security. Happy and unhappy paths. Doing this while actually using a running JWKS
deployment (like the auth0 backend) is slow and annoying, so e.g. auth0 suggest you mock their api. This turns out to be
somewhat difficult, especially in the case of using RSA for signing of the tokens and not wanting to heavily dependency inject the middleware for
authentication in your koa or express app. This is why I made this tool, which requires less changes to your code.

## Usage

Consider a basic `koa` app (works also with `express`, `hapi` or `graphql`):

```js
// api.js
import Koa from 'koa'
import Router from 'koa-router'
import jwt from 'koa-jwt'
import jwksRsa from 'jwks-rsa'
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
export default createApp
```

You can test this app like so:

```js
// authentication.test.js
import createJWKSMock from 'mock-jwks'
import createApp from './api.js'
import supertest from 'supertest'
import { beforeEach, describe, expect, test } from 'vitest'

describe('Some tests for authentication for our api', () => {
  let jwksMock, server, request
  beforeEach(() => {
    ;({ jwksMock, server, request } = createContext())
    return () => tearDown({ jwksMock, server })
  })

  test('should not get access without correct token', async () => {
    // We start intercepting queries (see below)
    jwksMock.start()
    const { status } = await request.get('/')
    expect(status).toEqual(401)
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
    'https://keycloak.somedomain.com',
    '/auth/realm/application/protocol/openid-connect/certs'
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
  const jwksMock = createJWKSMock('https://levino.eu.auth0.com')
  // We start our app.
  const server = createApp({
    jwksUri: 'https://levino.eu.auth0.com/.well-known/jwks.json',
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

You can also find [this example in the repo](example/authentication.test.js).

## Under the hood

`createJWKSMock` will create a local PKI and generate a working JWKS.json. Calling `jwksMock.start()` will use [msw](https://mswjs.io/)
to intercept all calls to

```typescript
;`${jwksBase}${jwksPath ?? '/.well-known/jwks.json'}`
```

. So when the `jwks-rsa` middleware gets a token to validate
it will fetch the key to verify against from our local PKI instead of the production one and as such, the token is valid
when signed with the local private key.

## Contributing

You found a bug or want to improve the software? Thank you for your support! Before you open a PR I kindly invite you to read about [best practices](https://eli.thegreenplace.net/2019/how-to-send-good-pull-requests-on-github/) and subject your contribution to them.
