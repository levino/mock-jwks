# Changelog

## [3.3.3](https://github.com/levino/mock-jwks/compare/v3.3.2...v3.3.3) (2025-02-06)


### Bug Fixes

* give correct permissions to token ([1e0b631](https://github.com/levino/mock-jwks/commit/1e0b631c255a9c5a4b3bb9a722c3bed08bda9e81))

## [3.3.2](https://github.com/levino/mock-jwks/compare/v3.3.1...v3.3.2) (2025-02-06)


### Bug Fixes

* correctly set token for publication ([8b46074](https://github.com/levino/mock-jwks/commit/8b460745af73f0ab01d2e7d9c68f7e4d91c5bc6f))

## [3.3.1](https://github.com/levino/mock-jwks/compare/v3.3.0...v3.3.1) (2025-02-06)


### Bug Fixes

* use npm to publish package ([f9d4209](https://github.com/levino/mock-jwks/commit/f9d42090ade701d03adffd3895954892f475541e))

## [3.3.0](https://github.com/levino/mock-jwks/compare/v3.2.2...v3.3.0) (2025-02-06)


### Features

* build an esmodule as well as an commonjs module ([fc23600](https://github.com/levino/mock-jwks/commit/fc236004942f73635816db5cdb550497bccb6bb1))

## [3.2.2](https://github.com/levino/mock-jwks/compare/v3.2.1...v3.2.2) (2024-07-17)


### Bug Fixes

* publication pipeline broken ([3e013dc](https://github.com/levino/mock-jwks/commit/3e013dcac62bf209c07202681f6a76a32c9a3bcc))

## [3.2.1](https://github.com/levino/mock-jwks/compare/v3.2.0...v3.2.1) (2024-07-17)


### Bug Fixes

* publication pipeline fails ([dd6635b](https://github.com/levino/mock-jwks/commit/dd6635b0debebdeea10eea9ecbaf58dafbe4f729))

## [3.2.0](https://github.com/levino/mock-jwks/compare/v3.1.0...v3.2.0) (2024-07-17)


### Features

* support custom msw server ([e8f341f](https://github.com/levino/mock-jwks/commit/e8f341fe100d6fadf3b74a0145f3c090a7510476))

## [3.1.0](https://github.com/levino/mock-jwks/compare/v3.0.0...v3.1.0) (2023-07-16)


### Features

* make createJWKS more robust on malformed base strings ([daa5d8a](https://github.com/levino/mock-jwks/commit/daa5d8a0c295fae62253da64803a298bf2c62b3d))

## [3.0.0](https://github.com/levino/mock-jwks/compare/v2.1.1...v3.0.0) (2023-07-16)


### ⚠ BREAKING CHANGES

* use msw instead of nock

### Features

* use msw instead of nock ([c0ecb79](https://github.com/levino/mock-jwks/commit/c0ecb799e3c477675541a5aaff7cd59be041bb92))

## [2.1.1](https://github.com/levino/mock-jwks/compare/v2.1.0...v2.1.1) (2023-07-16)


### Bug Fixes

* undo accidental release of msw suppport as minor release ([2dbfd9e](https://github.com/levino/mock-jwks/commit/2dbfd9e61bda4a77affbfadfa85edf31152da653))

## [2.1.0](https://github.com/levino/mock-jwks/compare/v2.0.3...v2.1.0) (2023-07-16)


### Features

* use msw instead of nock ([3f02804](https://github.com/levino/mock-jwks/commit/3f0280449b3d3630fe885a406ecc494c2adc8f02))

## [2.0.3](https://github.com/levino/mock-jwks/compare/v2.0.2...v2.0.3) (2023-03-15)


### Bug Fixes

* use npm package name in readme example ([bdc4ba6](https://github.com/levino/mock-jwks/commit/bdc4ba68ede8071d9a3cc8f6cff9a158ec247077))

## [2.0.2](https://github.com/levino/mock-jwks/compare/v2.0.1...v2.0.2) (2023-03-15)


### Bug Fixes

* correct format ([c76af27](https://github.com/levino/mock-jwks/commit/c76af274151f0bd3c305e96229f4deca50267e1b))
* re-add examples to readme for convenience ([60aa568](https://github.com/levino/mock-jwks/commit/60aa568ee40525ccf7ad79301b0b32067e25b131))

## [2.0.1](https://github.com/levino/mock-jwks/compare/v2.0.0...v2.0.1) (2023-03-15)


### Bug Fixes

* update readme for esm ([54c710c](https://github.com/levino/mock-jwks/commit/54c710c28e491ffae2a35cc74d9371273529d9b0))

## [2.0.0](https://github.com/levino/mock-jwks/compare/v1.0.9...v2.0.0) (2023-03-15)


### ⚠ BREAKING CHANGES

* make it an esmodule

### Features

* make it an esmodule ([b98f022](https://github.com/levino/mock-jwks/commit/b98f0227bb3e781171bd05d79044a9472df81499))

## [1.0.9](https://github.com/levino/mock-jwks/compare/v1.0.8...v1.0.9) (2022-12-23)


### Bug Fixes

* upgrade `jsonwebtoken` ([4976895](https://github.com/levino/mock-jwks/commit/4976895a17407a4418854e08d67f060eea2d6696))

## [1.0.8](https://github.com/levino/mock-jwks/compare/v1.0.7...v1.0.8) (2022-10-25)


### Bug Fixes

* typo ([19ac2a0](https://github.com/levino/mock-jwks/commit/19ac2a0360666163254789416c38ed71964813b9))

## [1.0.7](https://github.com/levino/mock-jwks/compare/v1.0.6...v1.0.7) (2022-10-25)


### Bug Fixes

* export JWKSMock interface and JwtPayload interface for convenience ([eea4b2e](https://github.com/levino/mock-jwks/commit/eea4b2e460c8167a35b78dceaed5c68e26fff54c)), closes [#83](https://github.com/levino/mock-jwks/issues/83)

## [1.0.6](https://github.com/levino/mock-jwks/compare/v1.0.5...v1.0.6) (2022-10-18)


### Bug Fixes

* disallow using numbers for "iat" and "exp" ([95f0777](https://github.com/levino/mock-jwks/commit/95f0777d4c06a31b7221c28a91abc65470ac55bf)), closes [#79](https://github.com/levino/mock-jwks/issues/79)

## [1.0.5](https://github.com/levino/mock-jwks/compare/v1.0.4...v1.0.5) (2022-10-16)


### Miscellaneous Chores

* use correct secret for npm publish ([78866a8](https://github.com/levino/mock-jwks/commit/78866a81ce98c986923ef35128f508b924450ebe))

## [1.0.4](https://github.com/levino/mock-jwks/compare/v0.3.3...v1.0.4) (2022-10-16)


### Miscellaneous Chores

* fix publish script ([9a654d8](https://github.com/levino/mock-jwks/commit/9a654d814e012c521912c08b3ac0961a6c979010))

## [0.3.3](https://github.com/levino/mock-jwks/compare/v0.3.2...v0.3.3) (2022-10-16)


### Bug Fixes

* build script ([2795747](https://github.com/levino/mock-jwks/commit/279574719b9e7c9dc04cef22353ffdb45430802e))

## [0.3.2](https://github.com/levino/mock-jwks/compare/v0.3.1...v0.3.2) (2022-10-16)


### Bug Fixes

* trigger release please ([7076a1c](https://github.com/levino/mock-jwks/commit/7076a1c25a98546a345edc573e5b5bea253043cd))
