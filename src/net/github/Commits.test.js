import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import {
  getLatestCommitHash,
} from './Commits'

import { initializeOctoKitAuthenticated, initializeOctoKitUnauthenticated } from './OctokitExport'

// Mock HTTP module for Commits
mock.module('./Http', () => ({
  getGitHub: mock((repo, path, args) => {
    // Return different responses based on repo orgName (passed in repo object)
    if (repo.orgName === 'failurecaseowner') {
      throw new Error('Unknown error: {"sha":"error"}')
    }
    return {
      data: [{ sha: 'testsha1testsha1testsha1testsha1testsha1' }],
    }
  }),
}))


describe('net/github/Commits', () => {
  beforeEach(() => {
    initializeOctoKitUnauthenticated() // Default to unauthenticated initialization
  })

  it('get latest commit hash', async () => {
    const result = await getLatestCommitHash('testowner', 'testrepo', '', '', '')
    expect(result).toEqual('testsha1testsha1testsha1testsha1testsha1')
  })

  describe('get latest commit hash failure case', () => {
    it('should throw an error when failing to get the latest commit hash', async () => {
      // Simulate failure conditions by passing specific owner and repo that would trigger the error
      await expect(getLatestCommitHash('failurecaseowner', 'failurecaserepo', '', '', ''))
        .rejects
        .toThrow('Unknown error: {"sha":"error"}')
    })
  })

  describe('Unauthenticated initialization', () => {
    it('should NOT throw an error on getLatestCommitHash with unauthedcaseowner and unauthedcaserepo', async () => {
      const result = await getLatestCommitHash('unauthedcaseowner', 'unauthedcaserepo', '', '', '')
      expect(result).toEqual('testsha1testsha1testsha1testsha1testsha1')
    })
  })

  describe('Authenticated initialization', () => {
    beforeEach(() => {
      // Authenticated initialization for this test
      initializeOctoKitAuthenticated()
    })

    it('should NOT throw an error on getLatestCommitHash with authedcaseowner and authedcaserepo', async () => {
      const result = await getLatestCommitHash('authedcaseowner', 'authedcaserepo', '', '', '')
      expect(result).toEqual('testsha1testsha1testsha1testsha1testsha1')
    })

    afterEach(() => {
      // Reset to unauthenticated for subsequent tests
      initializeOctoKitUnauthenticated()
    })
  })
})
