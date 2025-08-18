import { describe, it, expect, mock } from 'bun:test'
import { getRepositories } from './Repositories'
import { MOCK_REPOSITORY } from './Repositories.fixture'

// Use a simpler mock approach to avoid conflicts
const mockOctokitRequest = mock(() => ({ data: [MOCK_REPOSITORY] }))
mock.module('./OctokitExport', () => ({
  octokit: {
    request: mockOctokitRequest,
  },
}))

// Mock assert
mock.module('../../utils/assert', () => ({
  assertDefined: mock(),
}))


describe('net/github/Repositories', () => {
  describe('getRepositories', () => {
    it('successfully get repositories', async () => {
      const res = await getRepositories('bldrs-ai')
      expect(res).toEqual([MOCK_REPOSITORY])
    })
  })
})
