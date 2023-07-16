import { JwtPayload } from 'jsonwebtoken'
import { createJWKS, createKeyPair, signJwt } from './tools.js'
import { setupServer } from 'msw/node'
import { rest } from 'msw'

const createJWKSMock = (
  jwksBase: string,
  jwksPath = '/.well-known/jwks.json'
) => {
  const keypair = createKeyPair()
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin: jwksBase,
  })
  const server = setupServer(
    rest.get(new URL(jwksPath, jwksBase).href, (_, res, ctx) =>
      res(ctx.status(200), ctx.json(JWKS))
    )
  )

  const kid = () => JWKS.keys[0].kid

  const start = () => {
    server.listen({ onUnhandledRequest: 'bypass' })
  }
  const stop = () => {
    server.close()
  }

  const token = (token: JwtPayload = {}) =>
    signJwt(keypair.privateKey, token, kid())

  return {
    start,
    stop,
    kid,
    token,
  }
}

export type JWKSMock = ReturnType<typeof createJWKSMock>

export default createJWKSMock
