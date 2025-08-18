/* eslint-disable require-await */
import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import ShareMock from '../../ShareMock'
import useStore from '../../store/useStore'
import NotesControl from './NotesControl'
import model from '../../__mocks__/MockModel.js'

// Mock GitHub API for NotesControl testing
mock.module('../../net/github/Http', () => ({
  getGitHub: mock((repo, path, args) => {
    if (path.includes('issues')) {
      // Return 6 mock issues as expected by the test
      return {
        data: Array.from({ length: 6 }, (_, i) => ({
          id: i + 1,
          number: i + 1,
          title: `Issue ${i + 1}`,
          body: `Test issue ${i + 1}`,
          user: { login: 'testuser' },
          created_at: '2022-06-01T22:10:49Z',
        })),
      }
    }
    return { data: [] }
  }),
}))


window.HTMLElement.prototype.scrollIntoView = mock()


describe('NotesControl', () => {
  it('Does not issue fetch on initial page load when not visible', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(async () => {
      result.current.setNotes(null)
      result.current.setModel(model)
      result.current.setRepository('pablo-mayrgundter', 'Share')
    })
    await act(async () => {
      render(<ShareMock><NotesControl/></ShareMock>)
    })
    expect(result.current.notes).toBeNull()
  })

  it('Fetches issues on initial render when isNotesVisible in zustand', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(async () => {
      result.current.setNotes(null)
      result.current.setModel(model)
      result.current.setRepository('pablo-mayrgundter', 'Share')
      result.current.setIsNotesVisible(true)
    })
    await act(async () => {
      render(<ShareMock><NotesControl/></ShareMock>)
    })
    expect(result.current.notes).toHaveLength(6)
  })

  it('Fetches issues when isNotesVisible in zustand', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(async () => {
      result.current.setNotes(null)
      result.current.setModel(model)
      result.current.setRepository('pablo-mayrgundter', 'Share')
      result.current.setIsNotesVisible(false)
    })
    await act(async () => {
      render(<ShareMock><NotesControl/></ShareMock>)
    })
    expect(result.current.notes).toBeNull()
    await act(async () => {
      result.current.setIsNotesVisible(true)
    })
    expect(result.current.notes).toHaveLength(6)
  })
})

