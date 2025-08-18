import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { HelmetStoreRouteThemeCtx, RouteThemeCtx } from '../../Share.fixture'
import ImagineControl from './ImagineControl'


// Mock web-ifc-viewer for bun
mock.module('web-ifc-viewer', () => ({}))


describe('ImagineControl', () => {
  it('ControlButton visible', () => {
    const { getByTestId } = render(<ImagineControl/>, { wrapper: RouteThemeCtx })
    const component = getByTestId('control-button-rendering')
    expect(component).toBeInTheDocument()
  })

  it('updates the title when the dialog is open', async () => {
    const { getByTestId } = render(<ImagineControl/>, { wrapper: HelmetStoreRouteThemeCtx })

    const button = getByTestId('control-button-rendering')
    fireEvent.click(button)

    await(waitFor(() => expect(document.title).toBe('Imagine')))
  })
})
