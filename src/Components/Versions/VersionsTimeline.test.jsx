import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { ThemeCtx } from '../../theme/Theme.fixture'
import VersionsTimeline from './VersionsTimeline'
import { MOCK_COMMITS } from './VersionsTimeline.fixture'


describe('CustomTimeline', () => {
  it('displays the correct timeline items', () => {
    const commitNavigateCb = mock()
    const { getByText } = render(
      <ThemeCtx>
        <VersionsTimeline
          commits={MOCK_COMMITS}
          currentRef='main'
          commitNavigateCb={commitNavigateCb}
        />
      </ThemeCtx>)
    MOCK_COMMITS.forEach((commit) => {
      expect(getByText(commit.authorName)).toBeInTheDocument()
      expect(getByText(commit.commitDate)).toBeInTheDocument()
      expect(getByText(commit.commitMessage)).toBeInTheDocument()
    })
  })

  it('updates the active timeline item on click', () => {
    const commitNavigateCb = mock()
    const { getByText } = render(
      <ThemeCtx>
        <VersionsTimeline
          commits={MOCK_COMMITS}
          currentRef='main'
          commitNavigateCb={commitNavigateCb}
        />
      </ThemeCtx>)
    const firstItem = getByText(MOCK_COMMITS[0].authorName)
    fireEvent.click(firstItem)
    expect(commitNavigateCb).toHaveBeenCalledTimes(1)
  })
})
