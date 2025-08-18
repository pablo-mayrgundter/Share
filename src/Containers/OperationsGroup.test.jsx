import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { __getIfcViewerAPIExtendedMockSingleton } from 'web-ifc-viewer'
import { render, fireEvent } from '@testing-library/react'
import ShareMock from '../ShareMock'
import useStore from '../store/useStore'
import OperationsGroup from './OperationsGroup'


window.HTMLElement.prototype.scrollIntoView = mock(() => {})

// Use the existing web-ifc-viewer mock but enhance it with missing methods
const mockViewer = __getIfcViewerAPIExtendedMockSingleton()
mockViewer.setCustomViewSettings = mock(() => {})
mockViewer.setSelection = mock(() => {})

// Mock store functions
const mockSetViewer = mock(() => {})
const mockSetSelectedElement = mock(() => {})

mock.module('../store/useStore', () => {
  return {
    default: mock((selector) => {
      const state = {
        viewer: mockViewer,
        selectedElement: null,
        setViewer: mockSetViewer,
        setSelectedElement: mockSetSelectedElement,
        setCameraControls: mock(() => {}),
        setRepository: mock(() => {}),
      }
      return selector(state)
    }),
  }
})

// Instantiates ImagineControl which uses viewer's screenshot function
// mock.module('web-ifc-viewer', () => ({}))


describe('OperationsGroup', () => {
  const deselectItems = mock(() => {})

  it.skip('should render and trigger Properties button when a selected element is present', () => {
    // Update mock to have a selected element
    useStore.mockImplementation((selector) => {
      const state = {
        viewer: mockViewer,
        selectedElement: { id: 123 },
        model: {},
        isModelReady: true,
        isAppsEnabled: true,
        isImagineEnabled: true,
        isLoginEnabled: true,
        isNotesEnabled: true,
        isPropertiesEnabled: true,
        isShareEnabled: true,
        setViewer: mockSetViewer,
        setSelectedElement: mockSetSelectedElement,
        setCameraControls: mock(() => {}),
        setRepository: mock(() => {}),
      }
      return selector(state)
    })

    const { queryByTitle } = render(
        <ShareMock
          initialEntries={['/v/p/index.ifc#p:x']}
        >
          <OperationsGroup deselectItems={deselectItems}/>
        </ShareMock>,
    )
    const propertiesButton = queryByTitle('Properties')
    fireEvent.click(propertiesButton)
    expect(propertiesButton).toBeInTheDocument()
  })
})
