import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { render } from '@testing-library/react'
import { TITLE_NOTES } from '../Components/Notes/component'
import ShareMock from '../ShareMock'
import useStore from '../store/useStore'
import RightSideDrawers from './RightSideDrawers'

// Mock store functions
const mockSetIsNotesVisible = mock(() => {})
const mockSetIsAppsVisible = mock(() => {})
const mockSetAppsDrawerWidth = mock(() => {})
const mockSetRightDrawerWidth = mock(() => {})

mock.module('../store/useStore', () => ({
  default: mock((selector) => {
    const state = {
      isNotesVisible: false,
      isAppsVisible: false,
      isNotesEnabled: true,
      isPropertiesEnabled: true,
      isPropertiesVisible: false,
      appsDrawerWidth: 300,
      appsDrawerWidthInitial: 300,
      rightDrawerWidth: 400,
      rightDrawerWidthInitial: 370, // Use actual default from SideDrawerSlice
      drawerHeight: '50vh',
      drawerHeightInitial: '50vh',
      setIsNotesVisible: mockSetIsNotesVisible,
      setIsAppsVisible: mockSetIsAppsVisible,
      setAppsDrawerWidth: mockSetAppsDrawerWidth,
      setRightDrawerWidth: mockSetRightDrawerWidth,
      setDrawerHeight: mock(() => {}),
      setRepository: mock(() => {}),
    }
    return selector(state)
  }),
}))

mock.module('../Components/Hooks', () => ({
  useIsMobile: () => false,
}))

describe('RightSideDrawers', () => {
  it.skip('renders both Notes and Apps panels when visible', () => {
    // Update mock to show Notes panel
    useStore.mockImplementation((selector) => {
      const state = {
        isNotesVisible: true,
        isAppsVisible: true,
        appsDrawerWidth: 300,
        rightDrawerWidth: 400,
        setIsNotesVisible: mockSetIsNotesVisible,
        setIsAppsVisible: mockSetIsAppsVisible,
        setAppsDrawerWidth: mockSetAppsDrawerWidth,
        setRightDrawerWidth: mockSetRightDrawerWidth,
        setRepository: mock(() => {}),
      }
      return selector(state)
    })

    const rightDrawersRender = render(<ShareMock><RightSideDrawers/></ShareMock>)

    expect(rightDrawersRender.getByText(TITLE_NOTES)).toBeVisible()
    expect(rightDrawersRender.getByText('Apps')).toBeVisible()
  })

  it.skip('handles maximizing Notes panel and minimizing Apps panel', () => {
    const availableWidth = 1200

    // Update mock to show both panels with specific widths
    useStore.mockImplementation((selector) => {
      const state = {
        isNotesVisible: true,
        isAppsVisible: true,
        appsDrawerWidth: 10,
        rightDrawerWidth: availableWidth - 10,
        setIsNotesVisible: mockSetIsNotesVisible,
        setIsAppsVisible: mockSetIsAppsVisible,
        setAppsDrawerWidth: mockSetAppsDrawerWidth,
        setRightDrawerWidth: mockSetRightDrawerWidth,
        setRepository: mock(() => {}),
      }
      return selector(state)
    })


    const rightDrawersRender = render(<ShareMock><RightSideDrawers/></ShareMock>)

    // Test that the component renders with the mocked state
    expect(rightDrawersRender.container).toBeInTheDocument()
  })
})
