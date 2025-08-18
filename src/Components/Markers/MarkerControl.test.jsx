import { describe, it, expect, beforeEach, beforeAll, afterEach, mock } from 'bun:test'
import React from 'react'
import { act, render, renderHook } from '@testing-library/react'
import ShareMock from '../../ShareMock'
import useStore from '../../store/useStore'
import MarkerControl from './MarkerControl'
import { MOCK_MARKERS } from './Marker.fixture'
import { actAsyncFlush } from '../../utils/tests'
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three'
import { HASH_PREFIX_NOTES } from '../../Components/Notes/hashState'
import { HASH_PREFIX_PLACE_MARK } from './hashState'


window.HTMLElement.prototype.scrollIntoView = mock()
const mockedUseNavigate = mock()
const defaultLocationValue = { pathname: '/index.ifc', search: '', hash: '', state: null, key: 'default' }
// mock createObjectURL
global.URL.createObjectURL = mock(() => '1111111111111111111111111111111111111111')


mock.module('react-router-dom', () => ({
  useNavigate: () => mockedUseNavigate,
  useLocation: mock(() => defaultLocationValue),
}))

mock.module('postprocessing', () => ({}))

mock.module('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isLoading: false,
    isAuthenticated: false,
  }),
}))


describe('MarkerControl', () => {
  let originalWorker

  beforeAll(() => {
    // Store the original Worker in case other tests need it
    originalWorker = global.Worker
  })


  // TODO: `document.createElement` can't be used in testing-library directly,
  // need to move this after fixing that issue
  beforeEach(() => {
    mockedUseNavigate.mockClear()
  })


  afterEach(() => {
    mockedUseNavigate.mockClear()
    global.Worker = originalWorker
  })


  const mockCanvas = document.createElement('canvas')
  const mockContext = {
    getDomElement: mock(() => mockCanvas), // Return the mocked canvas element
    getCamera: mock(() => ({
      position: { x: 0, y: 0, z: 0 },
    })),
    getScene: mock(() => ({
      children: [],
    })),
  }


  const mockOppositeObjects = [
    new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 0x00ff00 }),
    ),
    new Mesh(
      new BoxGeometry(2, 2, 2),
      new MeshBasicMaterial({ color: 0xff0000 }),
    ),
  ]
  const mockPostProcessor = {}

  beforeEach(async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => result.current.setModelPath({ filepath: `/index.ifc` }))
    await act(() => {
      result.current.writeMarkers([])
      result.current.setSelectedPlaceMarkId(null)
    })
  })

  it('Renders MarkerControl without crashing', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => result.current.setModelPath({ filepath: `/index.ifc` }))
    const { container } = render(
      <ShareMock>
        <MarkerControl
          context={mockContext}
          oppositeObjects={mockOppositeObjects}
          postProcessor={mockPostProcessor}
        />
      </ShareMock>,
    )
    await actAsyncFlush()
    expect(container).toBeInTheDocument()
  })

  it('Updates the hash based on the selected placemark', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => result.current.setModelPath({ filepath: `/index.ifc` }))
    render(
      <ShareMock>
        <MarkerControl
          context={mockContext}
          oppositeObjects={mockOppositeObjects}
          postProcessor={mockPostProcessor}
        />
      </ShareMock>,
    )

    await actAsyncFlush()

    await act(() => {
      result.current.writeMarkers(MOCK_MARKERS)
    })

    await act(() => {
      result.current.setSelectedPlaceMarkId(MOCK_MARKERS[0].id)
    })

    const { coordinates, id } = MOCK_MARKERS[0]
    const expectedHash = `#${HASH_PREFIX_PLACE_MARK}:${coordinates.join(',')};${HASH_PREFIX_NOTES}:${id}`

    expect(window.location.hash).toBe(expectedHash)
  })
})
