import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { act, render, renderHook, waitFor } from '@testing-library/react'
import { StoreRouteThemeCtx } from '../../Share.fixture'
import useStore from '../../store/useStore'
import VersionsPanel from './VersionsPanel'
import {
  MOCK_MODEL_PATH_GIT,
  MOCK_REPOSITORY,
} from './VersionsPanel.fixture'
import { MOCK_COMMITS } from './VersionsTimeline.fixture'


// Mock useVersions for bun
const mockUseVersions = mock(() => ({ commits: [], loading: true }))
mock.module('./useVersions', () => ({
  default: mockUseVersions,
}))


describe('VersionsPanel', () => {
  it('renders the panel', async () => {
    // Simulated hook state
    let mockCommitsState = {
      commits: [],
      loading: true,
    }

    // Mock useCommits to return the current state
    mockUseVersions.mockImplementation(() => mockCommitsState)

    // Also setup store state
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => {
      result.current.setAccessToken('')
      result.current.setIsVersionsVisible(true)
      result.current.setRepository(MOCK_REPOSITORY.orgName, MOCK_REPOSITORY.name)
      result.current.setModelPath(MOCK_MODEL_PATH_GIT)
    })

    // Render the component
    const { getByText, getByTestId, rerender } = render(
      <VersionsPanel filePath='/test.ifc' currentRef='main'/>,
      { wrapper: StoreRouteThemeCtx },
    )

    // Ensure panel is rendered
    expect(getByTestId('VersionsPanel')).toBeInTheDocument()

    // Transition the state
    mockCommitsState = {
      commits: MOCK_COMMITS,
      loading: false,
    }

    // Re-render to simulate the state update
    rerender(
      <VersionsPanel filePath='/test.ifc' currentRef='main'/>,
      { wrapper: StoreRouteThemeCtx })

    // Wait for the updated state to be rendered
    await waitFor(() => {
      expect(getByTestId('VersionsPanel')).toBeInTheDocument()
    })
    MOCK_COMMITS.forEach((commit) => {
      expect(getByText(commit.authorName)).toBeInTheDocument()
      expect(getByText(commit.commitDate)).toBeInTheDocument()
      expect(getByText(commit.commitMessage)).toBeInTheDocument()
    })
  })
})
