import jwksClient from 'jwks-rsa'
import { beforeEach, describe, expect, test } from 'vitest'
import { createJWKSMock } from './index.js'

const auth0Mock = createJWKSMock('https://hardfork.eu.auth0.com')
const client = jwksClient({
  jwksUri: 'https://hardfork.eu.auth0.com/.well-known/jwks.json',
})

describe('Can start and stop', () => {
  test('Start, stop and start again', () => {
    let stop = auth0Mock.start()
    expect(() => stop()).not.toThrow()
    stop = auth0Mock.start()
    expect(() => stop()).not.toThrow()
  })
  test('Start twice', () => {
    expect(auth0Mock.start).not.toThrow()
    expect(auth0Mock.start).not.toThrow()
  })
  describe('in the before hook', () => {
    beforeEach(() => {
      auth0Mock.start()
      auth0Mock.start()
      auth0Mock.start()
    })
    test('Can stop', () => {
      expect(() => auth0Mock.stop()).not.toThrow()
    })
  })
})
