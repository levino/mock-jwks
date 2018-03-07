import { createJWKS, createKeyPair, signJwt } from './tools'
import * as nock from 'nock'
import * as request from 'superagent'
const createAuth0Mock = (jkwsHost) => {
  const keypair = createKeyPair()
  const { privateKey, publicKey } = keypair
  const JWKS = createJWKS(keypair)
  let jwksUrlNock
  return {
    start () {
      jwksUrlNock = nock(`${jkwsHost}`)
        .get('/.well-known/jwks.json')
        .reply(200, JWKS)
        .persist()
    },
    async stop () {
      if (jwksUrlNock) {
        jwksUrlNock.persist(false)
        try {
          // Kinda hacky but I did not find a good way to stop intercepting without using .cleanAll() which
          // might have side effects.
          await request.get(`${jkwsHost}/.well-known/jwks.json`)
        } catch (err) {
          console.log(err)
        }
      }
    },
    kid () {
      return JWKS.keys[0].kid
    },
    token (token = {}) {
      return signJwt(privateKey, token, this.kid())
    }
  }
}

export default createAuth0Mock
