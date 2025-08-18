import React from 'react'
import { describe, it, expect, mock } from 'bun:test'
import { act, render, renderHook } from '@testing-library/react'
import useStore from '../../store/useStore'
import NotesPanel from './NotesPanel'
import { RouteThemeCtx } from '../../Share.fixture'

// Mock Auth0 for NotesPanel
mock.module('@auth0/auth0-react', () => ({
  useAuth0: mock(() => ({
    user: {
      name: 'Unit Testing',
      nickname: 'testing',
      email: 'testing@example.com',
      email_verified: true,
      sub: 'github|1234567',
    },
    isAuthenticated: true,
    isLoading: false,
    getAccessTokenSilently: mock(),
    loginWithRedirect: mock(),
    logout: mock(),
  })),
}))

// Mock GitHub API for Notes panel
mock.module('../../net/github/Http', () => ({
  getGitHub: mock(() => ({ data: [] })),
  patchGitHub: mock(() => ({ data: { state: 'closed' } })),
}))

// Mock GitHub Issues and Comments modules
mock.module('../../net/github/Issues', () => ({
  createIssue: mock(() => Promise.resolve({ data: { id: 1, number: 1 } })),
  getIssueComments: mock(() => Promise.resolve({ data: [] })),
}))

mock.module('../../net/github/Comments', () => ({
  createComment: mock(() => Promise.resolve({ data: { id: 1 } })),
}))


describe('NotesPanel', () => {
  it('renders', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    const { getByTestId } = render(<NotesPanel/>, { wrapper: RouteThemeCtx })
    await act(() => {
      result.current.setSelectedNoteId(null)
    })
    expect(getByTestId('NotesPanel')).toBeInTheDocument()
  })
})
