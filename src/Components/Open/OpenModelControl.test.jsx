import { describe, it, expect, beforeEach, mock } from 'bun:test'
import React from 'react'
import { act, fireEvent, render, renderHook, waitFor } from '@testing-library/react'
import useStore from '../../store/useStore'
import { OpenModelControlFixture } from './OpenModelControl.fixture'
import { LABEL_GITHUB } from './component'

// Mock GitHub Organizations module for bun
const mockGetOrganizations = mock(() => Promise.resolve({}))
mock.module('../../net/github/Organizations', () => ({
  getOrganizations: mockGetOrganizations,
}))

// Create test-specific Auth0 mocks
const mockUserLoggedOut = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  getAccessTokenSilently: mock(),
  loginWithRedirect: mock(),
  logout: mock(),
}

const mockUserLoggedIn = {
  user: { nickname: 'testing', email: 'test@example.com' },
  isAuthenticated: true,
  isLoading: false,
  getAccessTokenSilently: mock(() => Promise.resolve('mock_token')),
  loginWithRedirect: mock(),
  logout: mock(),
}

// Create flexible auth mock for this test file
const testAuth0Mock = mock(() => mockUserLoggedOut)
mock.module('../../Auth0/Auth0Proxy', () => ({
  useAuth0: testAuth0Mock,
}))


describe('OpenModelControl', () => {
  beforeEach(() => {
    // Reset mock call counts
    mockGetOrganizations.mockClear()
  })
  it('Renders a login message if the user is not logged in', async () => {
    testAuth0Mock.mockReturnValue(mockUserLoggedOut)
    let getByTestId; let getByText
    await act(async () => {
      const rendered = render(<OpenModelControlFixture/>)
      getByTestId = rendered.getByTestId
      getByText = rendered.getByText
    })
    await act(async () => {
      const openControlButton = getByTestId('control-button-open')
      fireEvent.click(openControlButton)
    })
    await act(async () => {
      const GithubTab = getByText(LABEL_GITHUB)
      fireEvent.click(GithubTab)
    })
    const loginTextMatcher = (content, node) => {
      const hasText = (_node) => _node.textContent.includes('Host your model on GitHub and log in to Share')
      const nodeHasText = hasText(node)
      const childrenDontHaveText = Array.from(node.children).every(
          (child) => !hasText(child),
      )
      return nodeHasText && childrenDontHaveText
    }
    const loginText = getByText(loginTextMatcher)
    expect(loginText).toBeInTheDocument()
  })

  it('Renders file selector if the user is logged in', async () => {
    testAuth0Mock.mockReturnValue(mockUserLoggedIn)
    let getByTestId; let getByText
    await act(async () => {
      const rendered = render(<OpenModelControlFixture/>)
      getByTestId = rendered.getByTestId
      getByText = rendered.getByText
    })
    await act(async () => {
      const openControlButton = getByTestId('control-button-open')
      fireEvent.click(openControlButton)
    })
    await act(async () => {
      const GithubTab = getByText(LABEL_GITHUB)
      fireEvent.click(GithubTab)
    })
    const File = getByTestId('openFile')
    const Repository = await getByTestId('openRepository')
    expect(File).toBeInTheDocument()
    expect(Repository).toBeInTheDocument()
  })

  it('Does not fetch repo info on initial render when isOpenModelVisible=false in zustand', async () => {
    testAuth0Mock.mockReturnValue(mockUserLoggedIn)
    mockGetOrganizations.mockResolvedValue({})
    await act(async () => {
      render(<OpenModelControlFixture/>)
    })
    expect(mockGetOrganizations).not.toHaveBeenCalled()
  })

  it('Fetches repo info on initial render when isOpenModelVisible in zustand', async () => {
    testAuth0Mock.mockReturnValue(mockUserLoggedIn)
    mockGetOrganizations.mockResolvedValue({})
    const { result } = renderHook(() => useStore((state) => state))
    await act(async () => {
      result.current.setAccessToken('foo')
      result.current.setIsOpenModelVisible(true)
    })
    await act(async () => {
      render(<OpenModelControlFixture/>)
    })
    await waitFor(() => {
      expect(mockGetOrganizations).toHaveBeenCalled()
    })
  })
})
