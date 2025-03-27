import type { JwtPayload } from 'jsonwebtoken'
import { http, type HttpHandler, HttpResponse } from 'msw'
import { type SetupServerApi, setupServer } from 'msw/node'
import { createJWKS, createKeyPair, signJwt } from './tools.js'

export const createJWKSMock = (
  jwksBase: string,
  jwksPath = '/.well-known/jwks.json'
) => {
  const keypair = createKeyPair()
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin: jwksBase,
  })

  const handler: HttpHandler = http.get(new URL(jwksPath, jwksBase).href, () =>
    HttpResponse.json(JWKS)
  )

  const kid = () => JWKS.keys[0].kid

  let server: SetupServerApi | undefined

  const stop = () => {
    server?.close()
    server = undefined
  }

  const start = () => {
    if (server) {
      throw new Error('JWKSMock is already started')
    }
    server = setupServer(handler)
    server.listen({ onUnhandledRequest: 'bypass' })
    return () => stop()
  }

  const token = (token: JwtPayload = {}) =>
    signJwt(keypair.privateKey, token, kid())

  return {
    start,
    /**
     * @deprecated Use the thunk returned by `start` instead.
     */
    stop,
    kid,
    token,
    mswHandler: handler,
  }
}

export type JWKSMock = ReturnType<typeof createJWKSMock>

/**
 * @deprecated Use the named export instead
 */
export default createJWKSMock
