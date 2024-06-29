import { JwtPayload } from 'jsonwebtoken'
import { createJWKS, createKeyPair, signJwt } from './tools.js'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'

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
    http.get(new URL(jwksPath, jwksBase).href, () =>
      HttpResponse.json(JWKS),
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
