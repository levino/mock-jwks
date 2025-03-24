import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { createJWKSMock } from './index';

const auth0Mock = createJWKSMock('https://hardfork.eu.auth0.com');

describe('Invariant violation', () => {
  beforeEach(() => {
    auth0Mock.start();

    // As stated, a second call to start creates this error
    auth0Mock.start();
  });

  afterEach(() => {
    auth0Mock.stop();
  });

  test('Test #1', () => {
    expect(1).toBe(1);
  });

  test('Test #2', () => {
    expect(1).toBe(1);
  });
});
