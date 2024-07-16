# mock-jwks

A tool to mock a JWKS authentication service for development of microservices
CONSUMING authentication and authorization jwts.

## Breaking changes

As of version 2 and march 2023 this package is a
[pure esm package](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c).
I made an
[example](https://github.com/levino/use-mock-jwks/tree/4fd1622af213006dc7be32902273621bbe7aff3e)
on how to use the module. Use version 1 for a commonjs version.

## Background

If you use jwts for authentication and authorization of your users against your
microservices, you want to automatically unit test the authentication in your
microservice for security. Happy and unhappy paths. Doing this while actually
using a running JWKS deployment (like the auth0 backend) is slow and annoying,
so e.g. auth0 suggest you mock their api. This turns out to be somewhat
difficult, especially in the case of using RSA for signing of the tokens and not
wanting to heavily dependency inject the middleware for authentication in your
koa or express app. This is why I made this tool, which requires less changes to
your code.

## Usage

Consider a basic `express` app (works also with `koa`, `hapi` or `graphql`):

```js
// api.js
import express from 'express'
import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
export const createApp = ({ jwksUri }) =>
  express()
    .use(
      // We set up the jwksRsa client as usual (with production host)
      expressjwt({
        secret: jwksRsa.expressJwtSecret({
          cache: false, // We switch off caching to show how things work in ours tests.
          jwksUri,
        }),
        audience: 'private',
        issuer: 'master',
        algorithms: ['RS256'],
      })
    )
    .get('/', (_, res) => res.send('Authenticated'))
```

You can test this app like so:

```js
// authentication.test.js
// @ts-check
import { createJWKSMock } from 'mock-jwks'
import { createApp } from './api.js'
import supertest from 'supertest'
import { describe, expect, test, onTestFinished } from 'vitest'

// This creates the local PKI
const jwksMock = createJWKSMock('https://levino.eu.auth0.com')
// We start our app.
const app = createApp({
  jwksUri: 'https://levino.eu.auth0.com/.well-known/jwks.json',
})

describe('Some tests for authentication for our api', () => {
  test('should not get access without correct token', async () => {
    // We start intercepting queries (see below)
    onTestFinished(jwksMock.start())
    const { status } = await supertest(app).get('/')
    expect(status).toEqual(401)
  })

  test('should get access with mock token when jwksMock is running', async () => {
    // Again we start intercepting queries
    onTestFinished(jwksMock.start())
    const access_token = jwksMock.token({
      aud: 'private',
      iss: 'master',
    })
    const { status } = await supertest(app)
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
    const { status } = await supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${access_token}`)
    expect(status).toEqual(500)
  })
})
test('Another example with a non-auth0-style jkwsUri', async () => {
  const jwksMock = createJWKSMock(
    'https://keycloak.somedomain.com',
    '/auth/realm/application/protocol/openid-connect/certs'
  )
  // We start our app.
  const app = createApp({
    jwksUri:
      'https://keycloak.somedomain.com/auth/realm/application/protocol/openid-connect/certs',
  })
  const request = supertest(app)
  onTestFinished(jwksMock.start())
  const access_token = jwksMock.token({
    aud: 'private',
    iss: 'master',
  })
  const { status } = await request
    .get('/')
    .set('Authorization', `Bearer ${access_token}`)
  expect(status).toEqual(200)
})
```

You can also find [this example in the repo](examples/authentication.test.js).

### Custom Mock Server Worker (MSW) usage

Internally this library uses Mock Server Worker (MSW) to create network mocks
for the JWKS keyset. Instead of letting `mock-jwks` run its own `msw` instance,
you can add the required handlers to your running instance.

In this case, instead of calling `start()/stop()`, provide the `mswHandler` to
to your existing server instance:

```js
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
```

You can also find [this example in the repo](examples/customMSWServer.test.js).

## Under the hood

`createJWKSMock` will create a local PKI and generate a working JWKS.json.
Calling `jwksMock.start()` will use [msw](https://mswjs.io/) to intercept all
calls to

```typescript
;`${jwksBase}${jwksPath ?? '/.well-known/jwks.json'}`
```

. So when the `jwks-rsa` middleware gets a token to validate it will fetch the
key to verify against from our local PKI instead of the production one and as
such, the token is valid when signed with the local private key.

## Contributing

You found a bug or want to improve the software? Thank you for your support!
Before you open a PR I kindly invite you to read about
[best practices](https://eli.thegreenplace.net/2019/how-to-send-good-pull-requests-on-github/)
and subject your contribution to them.
