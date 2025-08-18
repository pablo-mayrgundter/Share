import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import { RouteThemeCtx } from '../../Share.fixture'
import useStore from '../../store/useStore'
import PropertiesPanel from './PropertiesPanel'


// Mock web-ifc-viewer for Properties tests
const mockModel = {
  getPropertySets: mock(() => Promise.resolve([])),
}

const mockViewer = {
  _loadedModel: mockModel,
}

mock.module('web-ifc-viewer', () => ({
  __getIfcViewerAPIExtendedMockSingleton: () => mockViewer,
}))


describe('PropertiesPanel', () => {
  it('renders', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => {
      result.current.setViewer(mockViewer)
    })
    const { getByTestId } = render(<PropertiesPanel/>, { wrapper: RouteThemeCtx })
    expect(getByTestId('PropertiesPanel')).toBeInTheDocument()
  })
})
