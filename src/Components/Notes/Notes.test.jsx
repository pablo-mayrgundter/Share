import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import { describe, it, expect, beforeEach, mock } from 'bun:test'
import ShareMock from '../../ShareMock'
import useStore from '../../store/useStore'
import Notes from './Notes'
import { MOCK_NOTES } from './Notes.fixture'

// Mock GitHub API for Notes testing - mock at HTTP level to intercept network calls
mock.module('../../net/github/Http', () => ({
  getGitHub: mock((repo, path, args) => {
    if (path.includes('issues') && path.includes('comments')) {
      return {
        data: [
          {
            id: 1,
            body: 'testComment_1',
            user: { login: 'testuser1' },
            created_at: '2022-06-01T22:10:49Z',
          },
          {
            id: 2,
            body: 'testComment_2',
            user: { login: 'testuser2' },
            created_at: '2022-06-01T22:11:49Z',
          },
        ],
      }
    }
    return { data: [] }
  }),
}))


window.HTMLElement.prototype.scrollIntoView = () => {}

describe('Notes', () => {
  beforeEach(async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => {
      result.current.setNotes(null)
    })
  })

  it('Setting notes in zustand', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    const { getByText } = render(<ShareMock><Notes/></ShareMock>)
    await act(() => {
      result.current.setSelectedNoteId(null)
    })
    await act(() => {
      result.current.setNotes(MOCK_NOTES)
    })
    expect(await getByText('open_workspace')).toBeInTheDocument()
    expect(await getByText('closed_system')).toBeInTheDocument()
  })

  it('No content message is present when notes are null', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    const { getByText } = render(<Notes/>)
    await act(() => {
      result.current.setSelectedNoteId(null)
    })
    await act(() => {
      result.current.setNotes([])
    })
    expect(await getByText('no content')).toBeInTheDocument()
  })

  it('Progress bar is visible when notes are loading', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    const { getByRole } = render(<Notes/>)
    await act(() => {
      result.current.toggleIsLoadingNotes()
    })
    expect(await getByRole('progressbar')).toBeInTheDocument()
    await act(() => {
      result.current.toggleIsLoadingNotes()
    })
  })


  it('Note rendered based on selected issue ID', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    const extractedNoteId = '10'
    const { findByText } = render(<ShareMock><Notes/></ShareMock>)
    await act(() => {
      result.current.setNotes(MOCK_NOTES)
    })
    await act(() => {
      result.current.setSelectedNoteId(Number(extractedNoteId))
    })
    expect(await findByText('open_workspace')).toBeVisible()
  })

  it('Fetch and display Comments when note is selected', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    const extractedNoteId = '10'
    const { findByText } = render(<ShareMock><Notes/></ShareMock>)
    await act(() => {
      result.current.setNotes(MOCK_NOTES)
    })
    await act(() => {
      result.current.setSelectedNoteId(Number(extractedNoteId))
    })
    expect(await findByText('testComment_1')).toBeVisible()
    expect(await findByText('testComment_2')).toBeVisible()
  })
})
