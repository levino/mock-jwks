import { JwtPayload } from 'jsonwebtoken'
import nock from 'nock'
import { createJWKS, createKeyPair, signJwt } from './tools'

const createJWKSMock = (
  jwksOrigin: string,
  jwksPath = '/.well-known/jwks.json'
) => {
  const keypair = createKeyPair()
  const JWKS = createJWKS({
    ...keypair,
    jwksOrigin,
  })
  let jwksUrlInterceptor: nock.Interceptor

  const kid = () => JWKS.keys[0].kid

  const start = () => {
    jwksUrlInterceptor = nock(jwksOrigin).get(jwksPath)
    jwksUrlInterceptor.reply(200, JWKS).persist()
  }
  const stop = () => {
    if (jwksUrlInterceptor) {
      nock.removeInterceptor(jwksUrlInterceptor)
    }
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

export default createJWKSMock
