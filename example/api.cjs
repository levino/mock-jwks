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
