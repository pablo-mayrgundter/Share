import { describe, it, expect, beforeAll, beforeEach, afterAll, mock } from 'bun:test'
import React from 'react'
import { act, render, waitFor, fireEvent } from '@testing-library/react'
import useStore from '../store/useStore'
import ViewerContainer from './ViewerContainer'


/**
 * Define DragEvent class for testing
 */
class DragEvent extends Event {
  /**
   * @param {string} type
   * @param {object} eventInitDict
   */
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict)
    this.dataTransfer = eventInitDict.dataTransfer || null
  }
}

// We will mock out relevant modules (store, guessType, OPFS saving, fallback saving)
// Define mockSetAlert at module level so it can be shared
const mockSetAlert = mock(() => {})
const mockNavigate = mock(() => {})

mock.module('../store/useStore', () => {
  return {
    default: mock((selector) => {
      const state = {
        appPrefix: '/app',
        isModelReady: true,
        isOpfsAvailable: true,
        vh: 800,
        setAlert: mockSetAlert,
        setRepository: mock(() => {}),
      }
      return selector(state)
    }),
  }
})

mock.module('react-router-dom', () => ({ useNavigate: () => mockNavigate }))
mock.module('../Filetype', () => ({ guessTypeFromFile: mock(() => {}) }))
mock.module('../OPFS/utils', () => ({ saveDnDFileToOpfs: mock(() => {}) }))
mock.module('../utils/loader', () => ({ saveDnDFileToOpfsFallback: mock(() => {}) }))

// We'll import the real dependencies from the mocks above
import { guessTypeFromFile } from '../Filetype'
import { saveDnDFileToOpfs } from '../OPFS/utils'
import { saveDnDFileToOpfsFallback } from '../utils/loader'


/**
 * Test suite for ViewerContainer component
 */
describe('ViewerContainer', () => {
  // Use the module-level mocks

  beforeAll(() => {
    window.DragEvent = DragEvent
  })

  beforeEach(() => {
    // Reset mock call history between tests
    mockSetAlert.mockClear()
    mockNavigate.mockClear()
  })

  afterAll(() => {
    window.DragEvent = null
  })

  it('renders the container', () => {
    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')
    expect(dropzone).toBeInTheDocument()
  })

  it('calls preventDefault and sets drag state on drag over', () => {
    // We won't see a direct "setIsDragActive" effect in the DOM unless we visually wire it up,
    // but we can ensure the event is prevented.
    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    const mockEvent = new DragEvent('dragover', { bubbles: true })
    Object.defineProperty(mockEvent, 'preventDefault', { value: mock(() => {}) })

    act(() => {
      dropzone.dispatchEvent(mockEvent)
    })
    expect(mockEvent.preventDefault.mock.calls.length).toBe(1)
  })

  it('calls preventDefault on drag leave', () => {
    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    const mockEvent = new DragEvent('dragleave', { bubbles: true })
    Object.defineProperty(mockEvent, 'preventDefault', { value: mock(() => {}) })

    dropzone.dispatchEvent(mockEvent)
    expect(mockEvent.preventDefault.mock.calls.length).toBe(1)
  })

  it('shows alert if 0 files are dropped', async () => {
    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    // Create a mock drop event with no files using fireEvent
    const dataTransfer = { files: [] }

    fireEvent.drop(dropzone, { dataTransfer })

    await waitFor(() => {
      expect(mockSetAlert.mock.calls.length).toBe(1)
      expect(mockSetAlert.mock.calls[0][0]).toBe('File upload initiated but found no data')
    })
  })

  it('shows alert if more than 1 file is dropped', async () => {
    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    const file1 = new File(['some content'], 'file1.txt', { type: 'text/plain' })
    const file2 = new File(['some content'], 'file2.txt', { type: 'text/plain' })

    const dataTransfer = { files: [file1, file2] }

    fireEvent.drop(dropzone, { dataTransfer })

    await waitFor(() => {
      expect(mockSetAlert.mock.calls.length).toBe(1)
      expect(mockSetAlert.mock.calls[0][0]).toBe('File upload initiated for more than 1 file')
    })
  })

  it.skip('shows alert if guessTypeFromFile returns null', async () => {
    // Reset and set mock implementation for this test
    guessTypeFromFile.mockImplementation = () => Promise.resolve(null)

    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    const file = new File(['some content'], 'unrecognized.abc', { type: 'application/x-unknown' })
    const dataTransfer = { files: [file] }
    const mockEvent = new DragEvent('drop', { bubbles: true })
    Object.defineProperty(mockEvent, 'dataTransfer', { value: dataTransfer })
    Object.defineProperty(mockEvent, 'preventDefault', { value: mock(() => {}) })

    dropzone.dispatchEvent(mockEvent)
    await waitFor(() => {
      expect(mockSetAlert.mock.calls.length).toBe(1)
      expect(mockSetAlert.mock.calls[0][0]).toBe(`File upload of unknown type: type(${file.type}) size(${file.size})`)
    })
  })

  it.skip('saves via OPFS if recognized type and isOpfsAvailable = true', async () => {
    // Reset and set mock implementations for this test
    guessTypeFromFile.mockImplementation = () => Promise.resolve('my-recognized-type')
    // Just ensure the actual saving call eventually calls onWritten => navigate.
    // We can simulate that by calling the third param from saveDnDFileToOpfs
    saveDnDFileToOpfs.mockImplementation = (_file, _type, onWritten) => {
      onWritten('myUploadedFileName')
    }

    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    const file = new File(['some content'], 'test.glb', { type: 'model/gltf-binary' })
    const dataTransfer = { files: [file] }
    const mockEvent = new DragEvent('drop', { bubbles: true })
    Object.defineProperty(mockEvent, 'dataTransfer', { value: dataTransfer })
    Object.defineProperty(mockEvent, 'preventDefault', { value: mock(() => {}) })

    dropzone.dispatchEvent(mockEvent)

    // Make sure we navigate to /app/v/new/myUploadedFileName
    await waitFor(() => {
      expect(saveDnDFileToOpfs.mock.calls.length).toBe(1)
      expect(mockNavigate.mock.calls.length).toBe(1)
      expect(mockNavigate.mock.calls[0][0]).toBe('/app/v/new/myUploadedFileName')
    })
  })

  it.skip('saves via fallback if recognized type and isOpfsAvailable = false', async () => {
    // We'll temporarily make the store return "false" for isOpfsAvailable
    // Easiest approach is to override the mock in the middle of the test
    // or we can do a specialized mock implementation.
    // We'll do a quick override:
    // Reset and set mock implementations for this test
    useStore.mockImplementation = (selector) => {
      const state = {
        appPrefix: '/app',
        isModelReady: true,
        isOpfsAvailable: false, // now false
        vh: 800,
        setAlert: mockSetAlert,
        setRepository: mock(() => {}),
      }
      return selector(state)
    }

    guessTypeFromFile.mockImplementation = () => Promise.resolve('my-recognized-type')
    saveDnDFileToOpfsFallback.mockImplementation = (_file, onWritten) => {
      onWritten('myFallbackFileName')
    }

    const component = render(<ViewerContainer/>)
    const dropzone = component.getByTestId('cadview-dropzone')

    const file = new File(['some content'], 'test.glb', { type: 'model/gltf-binary' })
    const dataTransfer = { files: [file] }
    const mockEvent = new DragEvent('drop', { bubbles: true })
    Object.defineProperty(mockEvent, 'dataTransfer', { value: dataTransfer })
    Object.defineProperty(mockEvent, 'preventDefault', { value: mock(() => {}) })

    dropzone.dispatchEvent(mockEvent)

    await waitFor(() => {
      expect(saveDnDFileToOpfsFallback.mock.calls.length).toBe(1)
      expect(mockNavigate.mock.calls.length).toBe(1)
      expect(mockNavigate.mock.calls[0][0]).toBe('/app/v/new/myFallbackFileName')
    })
  })
})
