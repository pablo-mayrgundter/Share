import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { loadLocalFile } from './loader'


describe('loadLocalFile', () => {
  beforeEach(() => {
    // Set up DOM
    document.body.innerHTML = `<div id="viewer-container"></div>`
    URL.createObjectURL = mock(() => 'testId')
  })

  afterEach(() => {
    // Clean up DOM
  })

  it('loads a local file and navigates to the appropriate URL', () => {
    let onLoadCalled = 0
    const onLoad = mock(() => {
 onLoadCalled++
})
    loadLocalFile(onLoad, true, true)

    // Mock input change event with a file
    const inputElement = document.querySelector('input[type="file"]')
    const file = new File(['dummy'], 'test.ifc')
    Object.defineProperty(inputElement, 'files', { value: [file] })

    const event = new Event('change', { bubbles: true })
    inputElement.dispatchEvent(event)

    expect(URL.createObjectURL).toHaveBeenCalledWith(file)
    expect(onLoadCalled).toBe(1)
  })

  it('throws an error if viewer-container is missing', () => {
    document.body.innerHTML = ''
    expect(() => {
      loadLocalFile(mock(() => {}), true, true)
    }).toThrow()
  })

  it('removes the file input after click if skipAutoRemove is false', () => {
    loadLocalFile(mock(() => {}), false, true)
    const inputElement = document.querySelector('input[type="file"]')
    expect(inputElement).toBeNull()
  })
})
