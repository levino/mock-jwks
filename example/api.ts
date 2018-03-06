
const Koa = require('koa')
const Router = require('koa-router')
const jwt = require('koa-jwt')
const jwksRsa = require('jwks-rsa')

// Start the server.

const createApp = ({jwksHost}) => {
  const app = new Koa()
// Custom 401 handling (first middleware)
  app.use(function (ctx, next) {
    return next().catch((err) => {
      if (err.status === 401) {
        ctx.status = 401;
        ctx.body = {
          error: err.originalError ? err.originalError.message : err.message
        };
      } else {
        throw err;
      }
    });
  });
  app.use(jwt({
    secret: jwksRsa.koaJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 2,
      jwksUri: `${jwksHost}/.well-known/jwks.json`
    }),
    audience: 'private',
    issuer: 'master',
    algorithms: [ 'RS256' ]
  }))

  const router = new Router()

  router.get('/', ctx => {
    ctx.body = 'Authenticated!'
  })

  app.use(router.middleware())
  return app
}

export default createApp
