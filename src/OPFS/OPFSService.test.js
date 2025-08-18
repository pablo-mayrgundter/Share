import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test'

// Mock the debug module so we can spy on its error method.
const mockDebugInstance = { 
  log: mock(),
  warn: mock(),
  error: mock(),
  time: mock(),
  timeEnd: mock(),
}
mock.module('../utils/debug', () => ({
  default: () => mockDebugInstance,
}))

// Mock the OctokitExport file with the required URL constants.
mock.module('../net/github/OctokitExport', () => ({
  GITHUB_BASE_URL_AUTHED: 'https://auth.bldrs.ai',
  GITHUB_BASE_URL_UNAUTHED: 'https://unauth.bldrs.ai',
}))

// Mock the OPFSService module
let mockWorkerInstance = null

mock.module('./OPFSService', () => {
  mockWorkerInstance = {
    postMessage: mock(),
    terminate: mock(),
    onmessage: null,
    addEventListener: mock(),
    removeEventListener: mock(),
  }

  return {
    initializeWorker: mock(() => mockWorkerInstance),
    terminateWorker: mock(),
    onWorkerMessage: mock((callback) => {
      if (mockWorkerInstance) {
        mockWorkerInstance.onmessage = callback
      }
    }),
    opfsWriteFile: mock(),
    opfsWriteModel: mock(),
    opfsDeleteModel: mock(),
    opfsDoesFileExist: mock(),
    opfsWriteModelFileHandle: mock(),
    opfsDownloadToOPFS: mock(),
    opfsDownloadModel: mock(),
    opfsWriteBase64Model: mock(),
    opfsReadFile: mock(),
    opfsReadModel: mock(),
    opfsClearCache: mock(),
    opfsSnapshotCache: mock(),
  }
})

describe('OPFSService module', () => {
  let opfsService

  // Import modules for bun
  beforeEach(async () => {
    // Reset worker state first
    if (opfsService) {
      opfsService.terminateWorker()
    }
    // In bun, we import the modules directly
    opfsService = await import('./OPFSService')
  })

  afterEach(() => {
    // Ensure worker is terminated between tests.
    opfsService.terminateWorker()
  })

  it('initializeWorker creates a new worker when none exists', () => {
    const worker = opfsService.initializeWorker()
    expect(worker).toBe(mockWorkerInstance)
    expect(opfsService.initializeWorker).toHaveBeenCalled()
  })

  it('initializeWorker returns the same worker if already initialized', () => {
    const worker1 = opfsService.initializeWorker()
    const worker2 = opfsService.initializeWorker()
    expect(worker2).toBe(worker1)
    expect(worker1).toBe(mockWorkerInstance)
  })

  it('terminateWorker terminates the worker and resets its reference', () => {
    // const worker = opfsService.initializeWorker()
    opfsService.terminateWorker()
    expect(opfsService.terminateWorker).toHaveBeenCalled()
  })

  it('opfsWriteFile calls the service function', () => {
    opfsService.opfsWriteFile('https://bldrs.ai/file', 'test.txt')
    expect(opfsService.opfsWriteFile).toHaveBeenCalledWith('https://bldrs.ai/file', 'test.txt')
  })

  it('opfsWriteFile calls terminate worker and then write file', () => {
    opfsService.terminateWorker()
    opfsService.opfsWriteFile('https://bldrs.ai/file', 'test.txt')
    expect(opfsService.terminateWorker).toHaveBeenCalled()
    expect(opfsService.opfsWriteFile).toHaveBeenCalledWith('https://bldrs.ai/file', 'test.txt')
  })

  it('opfsWriteModel calls the service function', () => {
    opfsService.opfsWriteModel('https://bldrs.ai/model', 'model.txt', 'commit123')
    expect(opfsService.opfsWriteModel).toHaveBeenCalledWith('https://bldrs.ai/model', 'model.txt', 'commit123')
  })

  it('opfsDeleteModel calls the service function', () => {
    opfsService.opfsDeleteModel('file.txt', 'commit456', 'ownerName', 'repoName', 'main')
    expect(opfsService.opfsDeleteModel).toHaveBeenCalledWith(
      'file.txt', 'commit456', 'ownerName', 'repoName', 'main',
    )
  })

  it('opfsDoesFileExist calls the service function', () => {
    opfsService.opfsDoesFileExist('file.txt', 'commit789', 'ownerName', 'repoName', 'main')
    expect(opfsService.opfsDoesFileExist).toHaveBeenCalledWith(
      'file.txt', 'commit789', 'ownerName', 'repoName', 'main',
    )
  })

  it('onWorkerMessage sets the callback', () => {
    const callback = mock()
    opfsService.onWorkerMessage(callback)
    expect(opfsService.onWorkerMessage).toHaveBeenCalledWith(callback)
  })

  it('opfsWriteModelFileHandle calls the service function', () => {
    const dummyFile = new File(['dummy content'], 'dummy.txt', { type: 'text/plain' })
    opfsService.opfsWriteModelFileHandle(dummyFile, 'dummyPath', 'commit999', 'ownerX', 'repoY', 'main')
    expect(opfsService.opfsWriteModelFileHandle).toHaveBeenCalledWith(
      dummyFile, 'dummyPath', 'commit999', 'ownerX', 'repoY', 'main',
    )
  })

  it('opfsDownloadToOPFS calls the service function', () => {
    const dummyProgress = mock()
    opfsService.opfsDownloadToOPFS(
      'https://bldrs.ai/file', 'commitAAA', 'filePath.txt', 'ownerX', 'repoY', 'main', dummyProgress,
    )
    expect(opfsService.opfsDownloadToOPFS).toHaveBeenCalledWith(
      'https://bldrs.ai/file', 'commitAAA', 'filePath.txt', 'ownerX', 'repoY', 'main', dummyProgress,
    )
  })

  it('opfsDownloadModel calls the service function', () => {
    const dummyProgress = mock()
    opfsService.opfsDownloadModel(
      'https://bldrs.ai/model', 'sha123', 'modelPath.txt', 'ownerX', 'repoY', 'main', 'token123', dummyProgress,
    )
    expect(opfsService.opfsDownloadModel).toHaveBeenCalledWith(
      'https://bldrs.ai/model', 'sha123', 'modelPath.txt', 'ownerX', 'repoY', 'main', 'token123', dummyProgress,
    )
  })

  it('opfsWriteBase64Model calls the service function', () => {
    opfsService.opfsWriteBase64Model(
      'base64Content', 'shaBase64', 'modelPath.txt', 'ownerX', 'repoY', 'main', 'token123',
    )
    expect(opfsService.opfsWriteBase64Model).toHaveBeenCalledWith(
      'base64Content', 'shaBase64', 'modelPath.txt', 'ownerX', 'repoY', 'main', 'token123',
    )
  })

  it('opfsReadFile calls the service function', () => {
    opfsService.opfsReadFile('readTest.txt')
    expect(opfsService.opfsReadFile).toHaveBeenCalledWith('readTest.txt')
  })

  it('opfsReadModel calls the service function', () => {
    opfsService.opfsReadModel('modelKey123')
    expect(opfsService.opfsReadModel).toHaveBeenCalledWith('modelKey123')
  })

  it('opfsClearCache calls the service function', () => {
    opfsService.opfsClearCache()
    expect(opfsService.opfsClearCache).toHaveBeenCalled()
  })

  it('opfsSnapshotCache calls the service function', () => {
    opfsService.opfsSnapshotCache()
    expect(opfsService.opfsSnapshotCache).toHaveBeenCalled()
  })
})
