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
