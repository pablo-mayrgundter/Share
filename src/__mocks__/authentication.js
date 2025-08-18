import { mock } from 'bun:test'

// Mock @auth0/auth0-react for bun
mock.module('@auth0/auth0-react', () => ({
  useAuth0: mock(),
}))

const mockGitHubUser = {
  name: 'Unit Testing',
  nickname: 'testing',
  picture: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAAAAACPAi4CAAAAwUlEQVR42u3VLQvCUBTGcT/LX6vMjyAIliVhYLELmgSzRbALA0EUVix' +
      'GQUEmFkG2riiO813EF+5Y8040nSed54ZfOOGegnyZggIKKKCAAj8DpnBOW4WhSINM3P8D8eGRBQTPIbYGXglhnXMHCihgD8zhlDaHkS2whMiUpIhvC0QQmLKBlS0gVTwzt' +
      '3Fu1sAEBu9xTLqCzwFpgetvj/tZE7wkB3Dtms+nc5EcgEjYq5VLTr2/yzxaAHqZFFBAAQXy5g5KPEV7KOa7LAAAAABJRU5ErkJggg==',
  email: 'testing@example.com',
  email_verified: true,
  sub: 'github|1234567',
  updated_at: '2023-02-22T17:07:29.123Z',
}

export const mockedUseAuth0 = mock()

export const mockedUserLoggedIn = {
  error: null,
  user: mockGitHubUser,
  isAuthenticated: true,
  isLoading: false,
  getAccessTokenSilently: mock(),
  getAccessTokenWithPopup: mock(),
  getIdTokenClaims: mock(),
  loginWithRedirect: mock(),
  loginWithPopup: mock(),
  logout: mock(),
}

export const mockedUserLoggedOut = {
  error: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  getAccessTokenSilently: mock(),
  getAccessTokenWithPopup: mock(),
  getIdTokenClaims: mock(),
  loginWithRedirect: mock(),
  loginWithPopup: mock(),
  logout: mock(),
}
