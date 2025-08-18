import { mock } from 'bun:test'

// Mock dependencies for bun
mock.module('three', () => ({}))
mock.module('../src/Infrastructure/IfcHighlighter', () => ({}))
mock.module('../src/Infrastructure/IfcIsolator', () => ({}))
mock.module('../src/Infrastructure/CustomPostProcessor', () => ({}))

const ifcjsMock = {}


// Not sure why this is required, but otherwise these internal fields
// are not present in the instantiated IfcViewerAPIExtended.
const loadedModel = {
  ifcManager: {
    getSpatialStructure: mock(),
    getProperties: mock((eltId) => ({})),
  },
  getIfcType: mock(),
  geometry: {
    boundingBox: {
      getCenter: mock(),
    },
    attributes: {
      expressID: 123,
    },
  },
}


const impl = {
  _isMock: true,
  _loadedModel: loadedModel,
  IFC: {
    addIfcModel: mock(),
    context: {
      fitToFrame: mock(),
      getCamera: mock(),
      getRenderer: mock(),
      getScene: mock(),
      ifcCamera: {
        cameraControls: {
          addEventListener: mock(),
          setPosition: mock((x, y, z) => {
            return {}
          }),
          getPosition: mock((x, y, z) => {
            const position = [0, 0, 0]
            return position
          }),
          setTarget: mock((x, y, z) => {
            return {}
          }),
          getTarget: mock((x, y, z) => {
            const target = [0, 0, 0]
            return target
          }),
        },
        currentNavMode: {
          fitModelToFrame: mock(),
        },
      },
      items: {
        ifcModels: [],
      },
    },
    setWasmPath: mock(),
    selector: {
      unpickIfcItems: mock(),
      selection: {
        meshes: [],
        material: null,
      },
      preselection: {
        material: null,
      },
    },
    loader: {
      ifcManager: {
        applyWebIfcConfig: mock(),
        ifcAPI: {
          GetCoordinationMatrix: mock(),
          getConwayVersion: mock(),
          getStatistics: mock(() => {
            return {
              getGeometryMemory: mock(),
              getGeometryTime: mock(),
              getLoadStatus: mock(),
              getOriginatingSystem: mock(),
              getParseTime: mock(),
              getPreprocessorVersion: mock(),
              getTotalTime: mock(),
              getVersion: mock(),
            }
          }),
        },
        parser: {},
        setupCoordinationMatrix: mock(),
        state: {},
      },
      parse: mock(() => loadedModel),
    },
  },
  clipper: {
    active: false,
    deleteAllPlanes: mock(() => {
      return 'cutPlane'
    }),
    context: {
      clippingPlanes: [],
    },
    createFromNormalAndCoplanarPoint: mock(() => {
      return 'createFromNormalAndCoplanarPoint'
    }),
    planes: [{
      plane: {
        normal: mock(),
        constant: 10,
      },
    }],
  },
  container: {
    style: {},
  },
  context: {
    getRenderer: mock(),
    getScene: mock(() => {
      return {
        add: mock(),
      }
    }),
    getCamera: mock(() => {
      return {
        currentNavMode: {
          fitModelToFrame: mock(),
        },
      }
    }),
    getClippingPlanes: mock(() => {
      return []
    }),
    renderer: {
      newScreenshot: mock(),
    },
    resize: mock(),
  },
  loadIfcUrl: mock(() => loadedModel),
  loadIfcFile: mock(() => loadedModel),
  getProperties: mock((modelId, eltId) => {
    return loadedModel.ifcManager.getProperties(eltId)
  }),
  pickIfcItemsByID: mock(),
  preselectElementsByIds: mock(),
  setSelection: mock(),
  setCustomViewSettings: mock(),
  takeScreenshot: mock(),
}
const constructorMock = mock(() => impl)


/**
 * @return {object} The single mock instance of IfcViewerAPI.
 */
function __getIfcViewerAPIExtendedMockSingleton() {
  return impl
}


export {
  ifcjsMock as default,
  constructorMock as IfcViewerAPI,
  __getIfcViewerAPIExtendedMockSingleton,
}
