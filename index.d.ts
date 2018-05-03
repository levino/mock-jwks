
export default createJWKSMock

declare function createJWKSMock(jwksHost: string): IJWKSMock;

interface IJWKSMock {
    start(): void
    stop(): Promise<void>
    kid(): string
    token(token: any): string
}