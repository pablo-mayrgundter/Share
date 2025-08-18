import { describe, it, expect, mock } from 'bun:test'
import { renderHook } from '@testing-library/react'
import { useExistInFeature } from './useExistInFeature'

// Mock react-router-dom for bun
mock.module('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams({ feature: 'app,placemark' })],
}))


describe('useExistInFeature', () => {
  it('check for the existence of a named feature in the URL SearchParams', () => {
    const appHook = renderHook(() => useExistInFeature('app'))
    expect(appHook.result.current).toBeTruthy()
    const placeMarkHook = renderHook(() => useExistInFeature('placemark'))
    expect(placeMarkHook.result.current).toBeTruthy()
    const exceptHook = renderHook(() => useExistInFeature('except'))
    expect(exceptHook.result.current).toBeFalsy()
  })
})
