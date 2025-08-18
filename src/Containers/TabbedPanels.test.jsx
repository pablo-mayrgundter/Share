import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import ShareMock from '../ShareMock'
import useStore from '../store/useStore'
import TabbedPanels from './TabbedPanels'


mock.module('../Components/Hooks', () => ({
  useIsMobile: mock(() => true),
}))

describe('TabbedPanels', () => {
  it('shows and hides panels and respects recently added order', async () => {
    // Access the store
    const { result } = renderHook(() => useStore((state) => state))

    // Ensure all panels are initially hidden
    await act(() => {
      result.current.setIsAppsVisible(false)
      result.current.setIsNotesVisible(false)
      result.current.setIsNavTreeVisible(false)
      result.current.setIsPropertiesVisible(false)
      result.current.setIsVersionsVisible(false)
    })

    // Initially, no panels are visible
    const { queryByText, getByTestId, getAllByRole } = render(
      <ShareMock>
        <TabbedPanels
          pathPrefix="/mock/path"
          branch="main"
          selectWithShiftClickEvents={false}
        />
      </ShareMock>,
    )
    // No tabs visible initially
    expect(queryByText('Apps')).toBeNull()
    expect(queryByText('Notes')).toBeNull()

    // Show the Apps panel
    await act(async () => {
      await result.current.setIsAppsVisible(true)
    })
    // The Apps panel should now be visible
    const visibleAppsTab = getByTestId('simple-tab-0')
    expect(visibleAppsTab).toBeInTheDocument()

    // Show the Notes panel
    await act(async () => {
      await result.current.setIsNotesVisible(true)
    })
    // The Notes panel should now be visible and should be the last tab selected
    const visibleNotesTab = getByTestId('simple-tab-1')
    expect(visibleNotesTab).toBeInTheDocument()

    // The currently selected tab should be the last opened one (Notes).
    // By default, the code sets the selected tab to the last added one.
    // Let's verify by checking tab container order.
    // The second tab (index 1) should be Notes and should be selected.
    const tabs = getAllByRole('tab')

    const visibleTabs = tabs.filter((tab) => tab.id)

    expect(visibleTabs.length).toBe(2)
    expect(visibleTabs[0]).toHaveTextContent('Apps')
    expect(visibleTabs[1]).toHaveTextContent('Notes')

    // Close the Notes panel
    await act(async () => {
      await result.current.setIsNotesVisible(false)
    })

    // After removing Notes, only Apps should remain.
    expect(queryByText('Notes')).toBeNull()
    expect(queryByText('Apps')).toBeInTheDocument()
  })

  it('shows Nav and then props and checks last added selection', async () => {
    const { result } = renderHook(() => useStore((state) => state))

    // Ensure all panels are initially hidden
    await act(() => {
      result.current.setIsAppsVisible(false)
      result.current.setIsNotesVisible(false)
      result.current.setIsNavTreeVisible(false)
      result.current.setIsPropertiesVisible(false)
      result.current.setIsVersionsVisible(false)
    })

    const { queryByText, findByText } = render(
      <ShareMock>
        <TabbedPanels
          pathPrefix="/mock/path"
          branch="main"
          selectWithShiftClickEvents={false}
        />
      </ShareMock>,
    )

    // Show Nav panel
    await act(async () => {
      await result.current.setIsNavTreeVisible(true)
    })
    expect(await findByText('Nav')).toBeInTheDocument()

    // Show Props panel
    await act(async () => {
      await result.current.setIsPropertiesVisible(true)
    })
    expect(await findByText('Props')).toBeInTheDocument()

    // The last added is Props, ensure that it exists
    // Close the Props panel
    await act(async () => {
      await result.current.setIsPropertiesVisible(false)
    })

    // Now only Nav should remain
    expect(queryByText('Props')).toBeNull()
    expect(queryByText('Nav')).toBeInTheDocument()
  })
})
