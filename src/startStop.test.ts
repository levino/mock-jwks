import jwksClient from 'jwks-rsa'
import { describe, expect, test } from 'vitest'
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
})
