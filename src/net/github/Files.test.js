import { describe, it, expect, mock } from 'bun:test'
import {
  commitFile,
  getDownloadUrl,
  getFiles,
  getFilesAndFolders,
} from './Files'
import { MOCK_FILES } from './Files.fixture'

// Mock the GitHub HTTP module for local testing
mock.module('./Http', () => ({
  getGitHub: mock((repo, path, args) => {
    // Different responses based on the path/args
    if (path.includes('contents') && args.path === 'README.md') {
      return {
        data: {
          download_url: `https://raw.githubusercontent.com/${repo.orgName}/${repo.name}/${args.ref || 'main'}/README.md${
            args.ref === 'main' ? '?token=MAINBRANCHCONTENT' :
            args.ref === 'a-new-branch' ? '?token=TESTTOKENFORNEWBRANCH' : ''
          }`,
          sha: 'abc123',
        },
        headers: { etag: 'test-etag' },
      }
    }
    if (path.includes('contents') && args.path === 'a-file-that-does-not-exists.txt') {
      throw new Error('Not Found')
    }
    // For getFiles calls
    return {
      data: MOCK_FILES.data,
      headers: { etag: 'test-etag' },
    }
  }),
  postGitHub: mock(() => ({
    commit: { sha: 'newCommitSha' },
    headers: { etag: 'test-etag' },
  })),
  deleteGitHub: mock(),
  patchGitHub: mock(),
}))

// Mock Cache module
mock.module('./Cache', () => ({
  checkCache: mock(() => null),
  updateCache: mock(),
}))

// Mock Octokit with both request and rest APIs
mock.module('./OctokitExport', () => ({
  octokit: {
    request: mock(() => ({
      data: MOCK_FILES.data,
      status: 200,
    })),
    rest: {
      git: {
        getRef: mock(() => ({ data: { object: { sha: 'ref-sha' } } })),
        getCommit: mock(() => ({ data: { tree: { sha: 'tree-sha' } } })),
        createBlob: mock(() => ({ data: { sha: 'blob-sha' } })),
        createTree: mock(() => ({ data: { sha: 'tree-sha' } })),
        createCommit: mock(() => ({ data: { sha: 'newCommitSha' } })),
        updateRef: mock(() => ({ data: {} })),
      },
      repos: {
        createOrUpdateFileContents: mock(() => ({
          data: { commit: { sha: 'newCommitSha' } },
        })),
        getContent: mock(() => ({ data: MOCK_FILES.data[0] })),
      },
    },
  },
}))


describe('net/github/Files', () => {
  describe('commit file', () => {
    it('commits a file and returns the new commit SHA', async () => {
      // Mock file data that should parse properly
      const file = new Blob(['test content'], { type: 'text/plain' })

      // if token passed but isn't valid, should throw 'Bad Credentials'
      expect(await commitFile('owner', 'repo', 'path', file, 'message', 'branch', 'dummyToken'))
        .toBe('newCommitSha')
    })
  })


  describe('getDownloadUrl', () => {
    it('bubbles up an exception for a non-existent object', async () => {
      try {
        await getDownloadUrl({ orgName: 'bldrs-ai', name: 'Share' }, 'a-file-that-does-not-exists.txt')
      } catch (e) {
        expect(e.toString()).toMatch('Not Found')
      }
    })

    it('returns a valid download Url', async () => {
      const downloadUrl = await getDownloadUrl({ orgName: 'bldrs-ai', name: 'Share' }, 'README.md')
      expect(downloadUrl).toEqual('https://raw.githubusercontent.com/bldrs-ai/Share/main/README.md')
    })

    it('returns expected download Url for a valid object within main branch', async () => {
      const downloadUrl = await getDownloadUrl({ orgName: 'bldrs-ai', name: 'Share' }, 'README.md', 'main')
      expect(downloadUrl).toEqual('https://raw.githubusercontent.com/bldrs-ai/Share/main/README.md?token=MAINBRANCHCONTENT')
    })

    it('returns a valid download Url when given a different Git ref', async () => {
      const downloadUrl = await getDownloadUrl({ orgName: 'bldrs-ai', name: 'Share' }, 'README.md', 'a-new-branch')
      expect(downloadUrl).toEqual('https://raw.githubusercontent.com/bldrs-ai/Share/a-new-branch/README.md?token=TESTTOKENFORNEWBRANCH')
    })
  })


  describe('getFiles', () => {
    it('successfully get files', async () => {
      const res = await getFiles('pablo-mayrgundter', 'Share')
      expect(res).toEqual(MOCK_FILES.data)
    })

    it('successfully get files and folders', async () => {
      const { files, directories } = await getFilesAndFolders('Share', 'pablo-mayrgundter', '/', '')
      expect(files.length).toEqual(1)
      expect(directories.length).toEqual(1)
    })
  })
})
