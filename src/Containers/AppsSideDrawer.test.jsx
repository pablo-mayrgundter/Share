import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import ShareMock from '../ShareMock'
import useStore from '../store/useStore'
import AppsSideDrawer from './AppsSideDrawer'
import { ID_RESIZE_HANDLE_X } from '../Components/SideDrawer/HorizonResizerButton'

// Mock store functions
const mockSetIsAppsVisible = mock(() => {})
const mockSetAppsDrawerWidth = mock(() => {})

mock.module('../store/useStore', () => {
  return {
    default: mock((selector) => {
      const state = {
        isAppsVisible: false,
        appsDrawerWidth: 300,
        appsDrawerWidthInitial: 300,
        selectedApp: null,
        drawerHeight: 400,
        drawerHeightInitial: 400,
        setIsAppsVisible: mockSetIsAppsVisible,
        setAppsDrawerWidth: mockSetAppsDrawerWidth,
        setDrawerHeight: mock(() => {}),
        setRepository: mock(() => {}),
      }
      return selector(state)
    }),
  }
})

mock.module('../Components/Hooks', () => ({
  useIsMobile: () => false, // Ensure desktop mode for resize handle tests
}))

describe('AppsSideDrawer', () => {
  it('renders the Apps panel when visible', () => {
    const mockSetDrawerWidth = mock(() => {})

    // Update the mock to return visible=true
    useStore.mockImplementation((selector) => {
      const state = {
        isAppsVisible: true,
        appsDrawerWidth: 300,
        appsDrawerWidthInitial: 300,
        selectedApp: null,
        drawerHeight: 400,
        drawerHeightInitial: 400,
        setIsAppsVisible: mockSetIsAppsVisible,
        setAppsDrawerWidth: mockSetAppsDrawerWidth,
        setDrawerHeight: mock(() => {}),
        setRepository: mock(() => {}),
      }
      return selector(state)
    })

    const component = render(<ShareMock><AppsSideDrawer setDrawerWidth={mockSetDrawerWidth}/></ShareMock>)
    const appsPanel = component.getByTestId('AppsPanel')
    expect(appsPanel).toBeVisible()
  })

  it('handles horizontal resizing with the resizer', () => {
    const mockSetDrawerWidth = mock((newWidth) => {
    })

    // Update the mock to return visible=true
    useStore.mockImplementation((selector) => {
      const state = {
        isAppsVisible: true,
        appsDrawerWidth: 300,
        appsDrawerWidthInitial: 300,
        selectedApp: null,
        drawerHeight: 400,
        drawerHeightInitial: 400,
        setIsAppsVisible: mockSetIsAppsVisible,
        setAppsDrawerWidth: mockSetAppsDrawerWidth,
        setDrawerHeight: mock(() => {}),
        setRepository: mock(() => {}),
      }
      return selector(state)
    })

    // Wrap the render call
    const appsRender = render(
      <ShareMock>
        <AppsSideDrawer setDrawerWidth={mockSetDrawerWidth}/>
      </ShareMock>,
    )

    const resizerEl = appsRender.getByTestId(ID_RESIZE_HANDLE_X)

    // Simulate resizing
    fireEvent.mouseDown(resizerEl)
    fireEvent.mouseMove(document, { clientX: 400 })
    fireEvent.mouseUp(document)

    // Assert the mock function was called
    expect(mockSetDrawerWidth.mock.calls.length).toBeGreaterThan(0)
  })
})
