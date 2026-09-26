import type { JwtPayload } from 'jsonwebtoken'
import { type HttpHandler, HttpResponse, http } from 'msw'
import { type SetupServer, setupServer } from 'msw/node'
import { createJWKS, createKeyPair, signJwt } from './tools.js'

export type { JwtPayload }

export interface JWKSMock {
  start: () => () => void
  /**
   * @deprecated Use the thunk returned by `start` instead.
   */
  stop: () => void
  kid: () => string
  token: (token?: JwtPayload) => string
  mswHandler: HttpHandler
}

export const createJWKSMock = (
  jwksBase: string,
  jwksPath = '/.well-known/jwks.json'
): JWKSMock => {
  const keypair = createKeyPair()
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin: jwksBase,
  })

  const handler: HttpHandler = http.get(new URL(jwksPath, jwksBase).href, () =>
    HttpResponse.json(JWKS)
  )

  const kid = () => JWKS.keys[0].kid

  let server: SetupServer | undefined

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
    stop,
    kid,
    token,
    mswHandler: handler,
  }
}

/**
 * @deprecated Use the named export instead
 */
const deprecatedDefaultExport: typeof createJWKSMock = createJWKSMock
export default deprecatedDefaultExport
