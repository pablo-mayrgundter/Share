import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { ThemeCtx } from '../../theme/Theme.fixture'
import LoginMenu from './ProfileControl'
import { MemoryRouter } from 'react-router-dom'
import useStore from '../../store/useStore'


export const withRouter = (ui, { route = '/' } = {}) => (
  <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
)


// Mock Auth0 for bun
const mockedUserLoggedOut = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  getAccessTokenSilently: mock(),
  loginWithRedirect: mock(),
  logout: mock(),
}

const mockedUserLoggedIn = {
  user: {
    name: 'Unit Testing',
    nickname: 'testing',
    email: 'testing@example.com',
    picture: 'https://example.com/avatar.png',
  },
  isAuthenticated: true,
  isLoading: false,
  getAccessTokenSilently: mock(() => Promise.resolve('mock_token')),
  loginWithRedirect: mock(),
  logout: mock(),
}

const mockedUseAuth0 = mock(() => mockedUserLoggedOut)
mock.module('../../Auth0/Auth0Proxy', () => ({
  useAuth0: mockedUseAuth0,
}))


describe('ProfileControl', () => {
  it('renders the login button when not logged in, and other links', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedOut)
    const { findByTestId, findByText } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const usersMenu = await findByTestId('control-button-profile')
    fireEvent.click(usersMenu)

    const Login = await findByTestId('menu-open-login-dialog')
    const JoinGithub = await findByText('Join GitHub')
    const BldrsWiki = await findByText('Bldrs Wiki')
    expect(Login).toBeInTheDocument()
    expect(JoinGithub).toBeInTheDocument()
    expect(BldrsWiki).toBeInTheDocument()
  })

  it('renders the user avatar when logged in', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedIn)
    const { findByTestId, findByText } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const usersMenu = await findByTestId('control-button-profile')
    fireEvent.click(usersMenu)

    const LoginWithGithub = await findByText('Log out')
    expect(LoginWithGithub).toBeInTheDocument()
  })

  it('renders the theme selection', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedIn)
    const { findByTestId, findByText } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const usersMenu = await findByTestId('control-button-profile')
    fireEvent.click(usersMenu)

    const dayThemeButton = await findByText('Night theme')
    expect(dayThemeButton).toBeInTheDocument()
  })

  it('renders the night theme when selected', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedIn)
    const { findByTestId, findByText } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const usersMenu = await findByTestId('control-button-profile')
    fireEvent.click(usersMenu)
    const dayThemeButton = await findByText('Night theme')
    fireEvent.click(dayThemeButton)

    const nighThemeButton = await findByText('Day theme')
    expect(nighThemeButton).toBeInTheDocument()
  })

  it('renders users avatar when logged in', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedIn)
    const { findByAltText } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const avatarImage = await findByAltText('Unit Testing')
    expect(avatarImage).toBeInTheDocument()
  })

  it('shows "Manage Subscription" for a paying (Pro) user', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedIn)

    // Set store state using renderHook
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => {
      result.current.setAppMetadata({
        userEmail: 'pro@test.com',
        stripeCustomerId: 'cus_test_123',
        subscriptionStatus: 'sharePro',
      })
    })

    const { findByTestId, queryByTestId } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const usersMenu = await findByTestId('control-button-profile')
    fireEvent.click(usersMenu)

    expect(await findByTestId('manage-subscription')).toBeInTheDocument()
    expect(queryByTestId('upgrade-to-pro')).toBeNull()
  })

  it('shows "Upgrade to Pro" for an authenticated Free user', async () => {
    mockedUseAuth0.mockReturnValue(mockedUserLoggedIn)

    // Set store state using renderHook
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => {
      result.current.setAppMetadata({
        userEmail: 'free@test.com',
        stripeCustomerId: null,
        subscriptionStatus: 'free',
      })
    })

    const { findByTestId, queryByTestId } = render(withRouter(<LoginMenu/>), { wrapper: ThemeCtx })
    const usersMenu = await findByTestId('control-button-profile')
    fireEvent.click(usersMenu)

    expect(await findByTestId('upgrade-to-pro')).toBeInTheDocument()
    expect(queryByTestId('manage-subscription')).toBeNull()
  })
})
