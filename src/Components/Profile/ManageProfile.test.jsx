import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import React from 'react'
import {
  render,
  fireEvent,
  waitFor,
} from '@testing-library/react'
import ManageProfile from './ManageProfile'
import { ThemeCtx } from '../../theme/Theme.fixture'


// Mock Auth0 for bun - override global setup
const mockUseAuth0 = mock()
mock.module('@auth0/auth0-react', () => ({
  useAuth0: mockUseAuth0,
}))

// Also override the Auth0Proxy to ensure we get our mock
mock.module('../../Auth0/Auth0Proxy', () => ({
  useAuth0: mockUseAuth0,
}))

// Mock environment to avoid useMock=true
mock.module('process', () => ({
  env: {
    OAUTH2_CLIENT_ID: 'test-client-id', // Not 'cypresstestaudience'
  },
}))

/* ─────────────────────────────────────────── helpers & mocks ── */
const baseUser = {
  sub: 'github|12345678',
  name: 'Unit Tester',
  email: 'tester@example.com',
  picture: 'https://example.com/avatar.png',
  identities: [], // custom claim fallback
}

let getAccessTokenSilently = mock()
let loginWithPopup = mock()


/* eslint-disable jsdoc/no-undefined-types */

/**
 * Render the ManageProfile component with mocked Auth0 context.
 *
 * @param {object} authOverrides - Overrides for the Auth0 user object.
 * @param {boolean} open - Whether the modal should be open.
 * @param {Function} onClose - Callback for when the modal is closed.
 * @return {RenderResult} The result of the render.
 */
function renderDlg(authOverrides = {}, open = true, onClose = mock()) {
  mockUseAuth0.mockReturnValue({
    user: { ...baseUser, ...authOverrides.user },
    isAuthenticated: true,
    getAccessTokenSilently,
    loginWithPopup,
    ...authOverrides,
  })

  return render(
    <ManageProfile open={open} onClose={onClose}/>,
    { wrapper: ThemeCtx },
  )
}

/* eslint-enable jsdoc/no-undefined-types */

beforeEach(() => {
  loginWithPopup = mock()
  getAccessTokenSilently = mock(() => Promise.resolve('primary.jwt'))
  global.window.open = mock(() => {})
})

afterEach(() => {
  loginWithPopup.mockClear()
  getAccessTokenSilently.mockClear()
  mockUseAuth0.mockClear()
})

/* ─────────────────────────────────────────── tests ──────────── */

describe('ManageProfile modal', () => {
  it('shows spinner while loading', () => {
    // Clear any previous mock calls first
    mockUseAuth0.mockClear()
    mockUseAuth0.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      getAccessTokenSilently: mock(),
      loginWithPopup: mock(),
    })
    const { getByRole } = render(<ManageProfile open={true} onClose={() => {}}/>, { wrapper: ThemeCtx })
    expect(getByRole('progressbar')).toBeInTheDocument()
  })

  it('renders "Connected" chip for linked provider and "Authorize" button for missing one', async () => {
    const { queryByRole, getByText, getByRole } = renderDlg({
      user: {
        identities: [{ provider: 'google-oauth2', user_id: 'g-123' }],
      },
    })

    await waitFor(() =>
      expect(queryByRole('progressbar')).toBeNull(),
    )

    // Google linked
    expect(getByText('Google')).toBeInTheDocument()

    // GitHub missing
    const authBtn = getByRole('button', { name: 'Authorize' })
    expect(authBtn).toBeInTheDocument()
  })

  it('opens popup with linkToken when "Authorize" clicked', async () => {
    const { queryByRole, getByRole } = renderDlg({
      user: {
        identities: [{ provider: 'google-oauth2', user_id: 'g-123' }],
      },
    })

    await waitFor(() =>
      expect(queryByRole('progressbar')).toBeNull(),
    )

    // click GitHub Authorize button specifically
    fireEvent.click(getByRole('button', { name: 'Authorize' }))

    // first getAccessTokenSilently (to produce linkToken)
    await waitFor(() => {
      expect(getAccessTokenSilently).toHaveBeenCalledTimes(1)
    })

    const urlArg = window.open.mock.calls[0][0]
    expect(urlArg).toMatch(
      /\/popup-auth\?connection=github&linkToken=/,
    )
  })

  it('refreshes tokens when "linkStatus=linked" storage event fires', async () => {
    renderDlg()

    // fake event
    fireEvent(
      window,
      new StorageEvent('storage', { key: 'linkStatus', newValue: 'linked' }),
    )

    await waitFor(() => {
      expect(getAccessTokenSilently).toHaveBeenCalledTimes(1)
    })
  })

  it('displays avatar, name and email', async () => {
    const { findByAltText, getByText } = renderDlg()

    expect(await findByAltText('Unit Tester')).toBeInTheDocument()
    expect(getByText('Unit Tester')).toBeInTheDocument()
    expect(getByText('tester@example.com')).toBeInTheDocument()
  })

  it('invokes onClose when Close button clicked', () => {
    const onClose = mock()
    const { getByRole } = renderDlg({}, true, onClose)

    fireEvent.click(getByRole('button', { name: 'Close' }))
    expect(onClose).toHaveBeenCalled()
  })
})
