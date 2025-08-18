import { describe, it, expect, mock } from 'bun:test'
import { getOrganizations } from './Organizations'

// Use a simpler mock approach to avoid conflicts
const mockOctokitRequest = mock(() => ({ data: [{ login: 'bldrs-ai' }] }))
mock.module('./OctokitExport', () => ({
  octokit: {
    request: mockOctokitRequest,
  },
}))

// Mock assert for validation
mock.module('../../utils/assert', () => ({
  assertDefined: mock((val) => {
    if (val === undefined) {
throw new Error('Arg 0 is not defined')
}
  }),
}))


describe('net/github/Organizations', () => {
  it('encounters an exception if no access token is provided', async () => {
    await expect(getOrganizations()).rejects.toThrow('Arg 0 is not defined')
  })

  it('receives a list of organizations', async () => {
    const orgs = await getOrganizations('testtoken')
    expect(orgs).toHaveLength(1)
    const org = orgs[0]
    expect(org.login).toEqual('bldrs-ai')
  })
})
