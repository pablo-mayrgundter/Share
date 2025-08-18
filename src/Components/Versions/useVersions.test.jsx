import { describe, it, expect, mock } from 'bun:test'
import { renderHook, waitFor } from '@testing-library/react'
import useVersions from './useVersions'
import { MOCK_COMMITS } from '../../net/github/Commits.fixture'

// Mock Auth0 for bun
mock.module('../../Auth0/Auth0Proxy', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
  }),
}))

// Mock GitHub API for bun
const mockGetCommitsForFile = mock(() => Promise.resolve(MOCK_COMMITS.data))
mock.module('../../net/github/Commits', () => ({
  getCommitsForFile: mockGetCommitsForFile,
}))


describe('useVersions', () => {
  it('fetches and returns commits', async () => {
    const { result } = renderHook(() => useVersions(TEST_PARAMS))
    await waitFor(() => expect(result.current.loading).toBe(true))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.commits.length).toEqual(MOCK_COMMITS.data.length)
    expect(result.current.error).toBe(null)
  })
})


const TEST_PARAMS = {
  repository: { name: 'testrepo', orgName: 'testowner' },
  filePath: 'test.ifc',
  accessToken: 'test-token',
}
