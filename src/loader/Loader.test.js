import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'
import { Object3D, Mesh, BufferGeometry, Material, BufferAttribute } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { load, readModel } from './Loader'


let originalMathRandom
let mockViewer
describe('Loader', () => {
  // three.js generates random UUIDs for loaded geometry and material
  // and also references them later, so it's not trivial to freeze or
  // delete them.  So, intercept its call to Math.random instead.
  // TODO(pablo): this should probably increment the value or smth to
  // make each UUID unique.
  beforeEach(() => {
    const rand = 0.5
    originalMathRandom = Math.random
    Math.random = mock(() => rand)

    mockViewer = {
      IFC: {
        type: null,
        addIfcModel: mock(() => {}),
        loader: {
          parse: mock(() => Promise.resolve({
            modelID: 0,
            loadStats: {},
            children: [],
            geometry: undefined,
            isObject3D: true,
          })),
          ifcManager: {
            state: {
              models: [],
            },
            applyWebIfcConfig: mock(() => Promise.resolve()),
            parse: mock(() => Promise.resolve({
              modelID: 0,
              loadStats: {},
              children: [],
              geometry: undefined,
              isObject3D: true,
            })),
            setupCoordinationMatrix: mock(() => {}),
            ifcAPI: {
              GetCoordinationMatrix: mock(() => Promise.resolve([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])),
              getStatistics: mock(() => ({
                getGeometryMemory: mock(() => 1024), // eslint-disable-line no-magic-numbers
                getGeometryTime: mock(() => 100), // eslint-disable-line no-magic-numbers
                getVersion: mock(() => 'IFC4'),
                getLoadStatus: mock(() => 'SUCCESS'),
                getOriginatingSystem: mock(() => 'Test'),
                getPreprocessorVersion: mock(() => '1.0'),
                getParseTime: mock(() => 50), // eslint-disable-line no-magic-numbers
                getTotalTime: mock(() => 150), // eslint-disable-line no-magic-numbers
              })),
              getConwayVersion: mock(() => '1.0.0'),
            },
          },
        },
        context: {
          items: {
            ifcModels: [],
          },
          fitToFrame: mock(() => {}),
        },
      },
    }
  })
  afterEach(() => {
    Math.random = originalMathRandom
  })

  it('loads a FBX model', async () => {
    mockViewer.IFC.type = 'fbx'
    const testPath = 'fbx/cube.fbx'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  it('loads a GLB model', async () => {
    mockViewer.IFC.type = 'glb'
    const testPath = 'glb/cube.glb'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  it('loads an OBJ model', async () => {
    mockViewer.IFC.type = 'obj'
    const testPath = 'obj/Bunny.obj'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    // Setup MockBlob with actual OBJ content
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  it('loads a PDB model', async () => {
    mockViewer.IFC.type = 'pdb'
    const testPath = 'pdb/caffeine.pdb'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    // Setup MockBlob with actual PDB file content
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  it('loads an STL model', async () => {
    mockViewer.IFC.type = 'stl'
    const testPath = 'stl/cube.stl'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    // Setup MockBlob with actual STL file content
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  it('loads a STEP model', async () => {
    mockViewer.IFC.type = 'step'
    const testPath = 'step/a-gear.step'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  it('loads an IFC model', async () => {
    mockViewer.IFC.type = 'ifc'
    const testPath = 'ifc/index.ifc'
    const onProgress = mock(() => {})
    const setOpfsFile = mock(() => {})
    const restoreArrayBuffer = testPathToContent(testPath)
    try {
      const model = await load(testPathToUrl(testPath), mockViewer, onProgress, true, setOpfsFile, '')
      expect(model).toBeDefined()
      expect(model).toMatchSnapshot()
    } finally {
      restoreArrayBuffer()
    }
  })

  describe('readModel', () => {
    it('passes through model with existing geometry unchanged', async () => {
      const mockLoader = {
        parse: mock(() => ({
          geometry: new BufferGeometry(),
          material: new Material(),
          isObject3D: true,
        })),
      }

      const result = await readModel(mockLoader, 'test-data', './', false, false, null, null)

      expect(result.geometry).toBeDefined()
      expect(result.geometry).toBeInstanceOf(BufferGeometry)
      expect(mockLoader.parse.mock.calls.length).toBe(1)
      expect(mockLoader.parse.mock.calls[0]).toEqual(['test-data', './'])
    })

    it('finds geometry in children when model has no direct geometry', async () => {
      // Mock mesh child with geometry
      const meshChild = new Mesh(new BufferGeometry(), new Material())
      meshChild.geometry.setAttribute('position', new BufferAttribute(new Float32Array([0, 0, 0]), 3))

      const mockLoader = {
        parse: mock(() => ({
          children: [
            new Object3D(), // First child without geometry
            meshChild, // Second child with geometry
          ],
          isObject3D: true,
        })),
      }

      const result = await readModel(mockLoader, 'test-data', './', false, false, null, null)

      expect(result.geometry).toBeDefined()
      expect(result.geometry).toBe(meshChild.geometry)
    })

    it('logs warning when model has no geometry and children have no geometry', async () => {
      const mockLoader = {
        parse: mock(() => ({
          children: [
            new Object3D(), // Child without geometry
            new Object3D(), // Another child without geometry
          ],
          isObject3D: true,
        })),
      }

      const result = await readModel(mockLoader, 'test-data', './', false, false, null, null)

      // expect(consoleSpy).toHaveBeenCalledWith('Could not identify default mesh to use for some operations')
      expect(result).toBeDefined()
    })

    it('throws error when loader returns null model', async () => {
      const mockLoader = {
        parse: mock(() => null),
      }

      await expect(readModel(mockLoader, 'test-data', './', false, false, null, null))
        .rejects.toThrow('Loader could not read model')
    })

    it('calls fixupCb when provided', async () => {
      const mockModel = {
        geometry: new BufferGeometry(),
        material: new Material(),
        isObject3D: true,
      }

      const mockLoader = {
        parse: mock(() => mockModel),
      }

      mockViewer.IFC.type = 'obj'
      const fixupCb = mock((model, viewer) => {
        expect(model).toBe(mockModel)
        expect(viewer).toBe(mockViewer)
        return { ...model, fixed: true }
      })

      const result = await readModel(mockLoader, 'test-data', './', false, false, mockViewer, fixupCb)

      expect(fixupCb.mock.calls.length).toBe(1)
      expect(fixupCb.mock.calls[0]).toEqual([mockModel, mockViewer])
      expect(result.fixed).toBe(true)
    })

    it('handles async loader correctly', async () => {
      const mockModel = {
        geometry: new BufferGeometry(),
        material: new Material(),
        isObject3D: true,
      }

      const mockLoader = {
        parse: mock(() => Promise.resolve(mockModel)),
      }

      const result = await readModel(mockLoader, 'test-data', './', true, false, null, null)

      expect(result).toBe(mockModel)
      expect(mockLoader.parse.mock.calls.length).toBe(1)
      expect(mockLoader.parse.mock.calls[0]).toEqual(['test-data', './'])
    })

    it('handles GLTFLoader with callback correctly', async () => {
      const mockModel = {
        geometry: new BufferGeometry(),
        material: new Material(),
        isObject3D: true,
      }

      // Create actual GLTFLoader instance and mock its parse method
      const mockLoader = new GLTFLoader()
      mockLoader.parse = mock((data, basePath, onLoad, onError) => {
        // Simulate immediate callback (not async)
        onLoad(mockModel)
      })

      const result = await readModel(mockLoader, 'test-data', './', false, false, null, null)

      expect(result).toBe(mockModel)
      expect(mockLoader.parse.mock.calls.length).toBe(1)
      expect(mockLoader.parse.mock.calls[0][0]).toBe('test-data')
      expect(mockLoader.parse.mock.calls[0][1]).toBe('./')
      expect(typeof mockLoader.parse.mock.calls[0][2]).toBe('function')
      expect(typeof mockLoader.parse.mock.calls[0][3]).toBe('function')
    })
  })
})


// Mock Blob for testing
/**
 * A mock Blob implementation for testing purposes.
 */
class MockBlob {
  /**
   * Creates an instance of MockBlob.
   *
   * @param {Array} content - The content of the blob.
   */
  constructor(content) {
    this.content = content
  }

  /**
   * Returns an ArrayBuffer representation of the blob content.
   *
   * @return {Promise<ArrayBuffer>} A promise that resolves to an ArrayBuffer.
   */
  async arrayBuffer() {
    await Promise.resolve() // Satisfy async requirement
    return new ArrayBuffer(this.content.length)
  }
}


// Mock Worker for testing
/**
 * A fake Worker implementation for testing purposes.
 */
class FakeWorker {
  /**
   * Creates an instance of FakeWorker.
   *
   * @param {string} script - The URL or identifier of the worker script.
   */
  constructor(script) {
    this.script = script
    this.postMessage = mock(() => {})
    this.terminate = mock(() => {})
    this.onmessage = null
    this.addEventListener = mock((event, handler) => {
      // Simulate successful file download
      if (event === 'message') {
        process.nextTick(() => {
          handler({ data: { completed: true, event: 'download', file: new MockBlob(['mock file content']) } })
        })
      }
    })
    this.removeEventListener = mock(() => {})
  }
}
global.Worker = FakeWorker


/**
 * @param {string} relativePath
 * @return {string}
 */
function testPathToUrl(relativePath) {
  return require('path').resolve(__dirname, `../../testdata/models/${relativePath}`)
}


/**
 * @param {string} relativePath
 * @return {Function} A function that restores the original arrayBuffer method.
 */
function testPathToContent(relativePath) {
  // Determine if file is binary based on extension
  const binaryExtensions = ['fbx', 'glb', 'gltf']
  const extension = relativePath.split('.').pop().toLowerCase()
  const isBinary = binaryExtensions.includes(extension)

  const content = readTestDataFile(relativePath, isBinary)
  return setupMockBlobWithContent(content)
}


// Helper function to read test data files
/**
 * Reads a test data file and returns its content.
 *
 * @param {string} relativePath - Path relative to testdata/models/
 * @param {boolean} [isBinary] - Whether to read as binary data
 * @return {string|Buffer} The file content as a string or Buffer.
 */
function readTestDataFile(relativePath, isBinary = false) {
  const fs = require('fs')
  const path = require('path')
  const filePath = path.resolve(__dirname, `../../testdata/models/${relativePath}`)
  return fs.readFileSync(filePath, isBinary ? null : 'utf8')
}


// Helper function to setup MockBlob with file content
/**
 * Sets up MockBlob to return the specified file content.
 *
 * @param {string|Buffer} fileContent - The content to return from arrayBuffer().
 * @return {Function} A function to restore the original arrayBuffer method.
 */
function setupMockBlobWithContent(fileContent) {
  const originalArrayBuffer = MockBlob.prototype.arrayBuffer
  MockBlob.prototype.arrayBuffer = async function() {
    await Promise.resolve() // Satisfy async requirement

    if (Buffer.isBuffer(fileContent)) {
      // Handle binary data
      return fileContent.buffer.slice(fileContent.byteOffset, fileContent.byteOffset + fileContent.byteLength)
    } else {
      // Handle text data
      const encoder = new TextEncoder()
      return encoder.encode(fileContent).buffer
    }
  }
  return () => {
    MockBlob.prototype.arrayBuffer = originalArrayBuffer
  }
}
