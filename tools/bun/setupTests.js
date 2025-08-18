/* eslint-disable no-empty-function */
// Bun test setup - provides Jest-compatible globals and setup
import React from 'react'
import '@testing-library/jest-dom'
import 'regenerator-runtime/runtime'
import { cleanup } from '@testing-library/react'
import { beforeAll, afterAll, afterEach, describe, mock } from 'bun:test'
import { disableDebug } from '../../src/utils/debug'
import { getAndExportEnvVars } from '../jest/vars.jest'
import { GlobalRegistrator } from '@happy-dom/global-registrator'
import * as THREE from 'three'


GlobalRegistrator.register()

// Set up global THREE for three-mesh-bvh compatibility
global.THREE = THREE
global.three = THREE

// Mock three-mesh-bvh to prevent Vector3 constructor issues
mock.module('three-mesh-bvh', () => ({
  // Mock the main exports that components might use
  MeshBVH: class MockMeshBVH {},
  ExtendedTriangle: class MockExtendedTriangle {},
  acceleratedRaycast: () => {},
  computeBoundsTree: () => {},
  disposeBoundsTree: () => {},
  CONTAINED: 0,
  INTERSECTED: 1,
  NOT_INTERSECTED: 2,
  StaticGeometryGenerator: class MockStaticGeometryGenerator {},
  GenerateMeshBVHWorker: class MockGenerateMeshBVHWorker {},
}))

// Mock web-ifc-viewer globally to prevent IfcViewerAPI import issues
const mockViewer = {
  IFC: {
    setWasmPath: mock(),
    context: {
      ifcCamera: {
        cameraControls: {
          addEventListener: mock(),
          setPosition: mock(),
          getPosition: mock(() => [0, 0, 0]),
          setTarget: mock(),
          getTarget: mock(() => [0, 0, 0]),
        },
      },
    },
  },
  _loadedModel: {
    ifcManager: {
      getSpatialStructure: mock(() => ({})),
    },
    getPropertySets: mock(() => Promise.resolve([])),
  },
  context: {
    getDomElement: mock(() => document.createElement('div')),
  },
  clipper: {
    planes: [],
    createFromNormalAndCoplanarPoint: mock(),
    deleteAllPlanes: mock(),
  },
  isolator: {
    hideSelectedElements: mock(),
    hideElementsById: mock(),
    unHideAllElements: mock(),
    toggleIsolationMode: mock(),
    setModel: mock(),
  },
  setSelection: mock(),
  setCustomViewSettings: mock(),
  getSelectedIds: mock(() => []),
  preselectElementsByIds: mock(),
  highlightIfcItem: mock(),
  setHighlighted: mock(),
  getProperties: mock(),
  pickIfcItemsByID: mock(),
}

mock.module('web-ifc-viewer', () => ({
  IfcViewerAPI: class MockIfcViewerAPI {},
  __getIfcViewerAPIExtendedMockSingleton: () => mockViewer,
}))

// Make viewer globally available for tests
global.mockViewer = mockViewer

// Mock hash state functions to return false in tests to prevent automatic visibility
mock.module('../../src/Components/Notes/hashState', () => ({
  isVisibleInitially: () => false,
  removeHashParams: mock(),
  removeCommentParamsFromHash: (hash) => hash,
  removeNotesParamsFromHash: (hash) => hash,
  setHashParams: mock(),
  setCommentParamsToHash: (hash, params) => hash,
  setNotesParamsToHash: (hash, params) => hash,
  navBackToIssue: mock(),
  HASH_PREFIX_NOTES: 'i',
  HASH_PREFIX_COMMENT: 'ic',
}))

const { initServer } = require('../../src/__mocks__/server.bun')


// eslint-disable no-empty-function

disableDebug()

const server = initServer(getAndExportEnvVars())

// Establish API mocking before all tests.
beforeAll(() => {
  server.listen({
    onUnhandledRequest: 'error', // Warns about unhandled requests
  })
})

// Like cypress - provide context as alias for describe
global.context = describe

// Provide Jest-compatible mock function
global.jest = {
  mock: (moduleName, factory) => {
    // Bun handles mocks differently - for now, just log and skip
    console.warn(`jest.mock('${moduleName}') called - bun handles mocks differently`)
  },
  mocked: (fn) => fn, // Simple passthrough for now
  fn: () => ({ mockImplementation: () => {}, mockReturnValue: () => {} }), // Basic mock function
}

// Polyfill TextEncoder/TextDecoder for test environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  global.TextEncoder = TextEncoder
  global.TextDecoder = TextDecoder
}

// Polyfill DOM globals for tests that need them
if (typeof global.window === 'undefined') {
  global.window = {
    location: { href: 'http://localhost:3000/', hash: '', search: '', pathname: '/' },
    onhashchange: null,
    innerWidth: 1024,
    innerHeight: 768,
    addEventListener: () => {},
    removeEventListener: () => {},
  }
  global.location = global.window.location
}

// Mock localStorage
if (typeof global.localStorage === 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
  }
}

// Mock document.cookie for js-cookie library
let cookieStore = {}
Object.defineProperty(global.document, 'cookie', {
  get() {
    return Object.entries(cookieStore)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
  },
  set(cookieString) {
    const [nameValue] = cookieString.split(';')
    const [name, value] = nameValue.split('=')
    if (value === undefined) {
      delete cookieStore[name]
    } else {
      cookieStore[name] = value
    }
  },
})

// Mock Auth0 for all tests - basic default
const mockAuth0User = {
  name: 'Unit Testing',
  nickname: 'testing',
  email: 'testing@example.com',
  email_verified: true,
  sub: 'github|1234567',
}

mock.module('../../src/Auth0/Auth0Proxy', () => ({
  useAuth0: () => ({
    user: mockAuth0User,
    isAuthenticated: true,
    isLoading: false,
    getAccessTokenSilently: mock(() => Promise.resolve('eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwibmFtZSI6InRlc3QiLCJpYXQiOjE1MTYyMzkwMjJ9.test')),
    loginWithRedirect: mock(),
    logout: mock(),
  }),
  mockGitHubUser: mockAuth0User,
}))


// Mock SVG imports to return React components
mock.module('../../src/assets/icons/Attention.svg', () => ({
  default: ({ className, ...props }) => React.createElement('svg', {
    'data-testid': 'attention-icon',
    className,
    ...props,
  }),
}))

mock.module('../../src/assets/icons/Tree.svg', () => ({
  default: ({ className, ...props }) => React.createElement('svg', {
    'data-testid': 'tree-icon',
    className,
    ...props,
  }),
}))

mock.module('../../src/assets/icons/Question.svg', () => ({
  default: ({ className, ...props }) => React.createElement('svg', {
    'data-testid': 'question-icon',
    className,
    ...props,
  }),
}))

mock.module('../../src/assets/icons/Bot2.svg', () => ({
  default: ({ className, ...props }) => React.createElement('svg', {
    'data-testid': 'bot2-icon',
    className,
    ...props,
  }),
}))

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
// Also cleanup DOM elements from testing-library and reset cookies
afterEach(() => {
  server.resetHandlers()
  cleanup()
  cookieStore = {} // Reset cookies between tests
  
  // Note: Three.js has global ID counters that increment across tests:
  // - BufferGeometry: let _id = 0 (node_modules/three/src/core/BufferGeometry.js:13)
  // - Object3D: let _object3DId = 0 (node_modules/three/src/core/Object3D.js:10)
  // - Material: let materialId = 0 (node_modules/three/src/materials/Material.js:5)
  // - Texture: let textureId = 0 (node_modules/three/src/textures/Texture.js:18)
  // These cannot be reset without breaking Three.js exports, so snapshots 
  // must account for test execution order dependencies
  
  // Reset zustand store state between tests to prevent state leakage
  try {
    const useStore = require('../../src/store/useStore').default
    const store = useStore.getState()
    if (store.resetStore && typeof store.resetStore === 'function') {
      store.resetStore()
      // Also set the viewer to the mock for tests that need it
      if (store.setViewer && global.mockViewer) {
        store.setViewer(global.mockViewer)
      }
    }
  } catch (e) {
    // Ignore if store is mocked in individual tests
  }

  // Clear any values stored in localStorage between tests
  if (global.localStorage && typeof global.localStorage.clear === 'function') {
    global.localStorage.clear()
  }

  // Reset window location fields to their defaults
  if (global.window && global.window.location) {
    global.window.location.href = 'http://localhost/'
    global.window.location.hash = ''
    global.window.location.search = ''
    global.window.location.pathname = '/'
  }
  // If other window properties are mutated, consider recreating the window object
})

// Clean up after the tests are finished.
afterAll(() => server.close())
