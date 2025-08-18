// Mock the entire module
import { describe, it, expect, beforeEach, afterAll, mock } from 'bun:test'
import * as OPFSService from '../OPFS/OPFSService.js'
import {
  writeSavedGithubModelOPFS,
  getModelFromOPFS,
  downloadToOPFS,
  downloadModel,
  doesFileExistInOPFS,
  deleteFileFromOPFS,
  checkOPFSAvailability,
  snapshotOPFS,
  clearOPFSCache } from './utils'

// Mock OPFSService module for bun
mock.module('../OPFS/OPFSService.js', () => ({
  initializeWorker: mock(() => ({})),
  opfsWriteModelFileHandle: mock(() => {}),
  opfsReadModel: mock(() => {}),
  opfsDownloadToOPFS: mock(() => {}),
  opfsDownloadModel: mock(() => {}),
  opfsDoesFileExist: mock(() => {}),
  opfsDeleteModel: mock(() => {}),
  opfsSnapshotCache: mock(() => {}),
  opfsClearCache: mock(() => {}),
}))

describe('OPFS Test Suite', () => {
  beforeEach(() => {
    // Setup or reset mock implementations before each test
    OPFSService.initializeWorker.mockReturnValue({
      addEventListener: mock(() => {}),
      removeEventListener: mock(() => {}),
    })
  })

  describe('writeSavedGithubModelOPFS', () => {
    it('should resolve true when worker completes writing file', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          // Simulate successful worker operation
          process.nextTick(() => handler({ data: { completed: true, event: 'write' } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)
      const result = await writeSavedGithubModelOPFS('mockFile', 'originalFileName', 'commitHash', 'owner', 'repo', 'branch')
      expect(result).toBe(true)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(OPFSService.opfsWriteModelFileHandle)
          .toHaveBeenCalledWith('mockFile', 'originalFileName', 'commitHash', 'owner', 'repo', 'branch')
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalled()
    })
  })

  describe('getModelFromOPFS', () => {
    it('should resolve with file when worker completes retrieving file', async () => {
      // Create a mock file as the expected result
      const mockFile = new Blob(['dummy content'], { type: 'text/plain' })
      const mockFileResponse = { completed: true, file: mockFile }

      // Set up the mock worker behavior
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          // Simulate worker successfully retrieving the file
          process.nextTick(() => handler({ data: mockFileResponse }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      // Call the function with test data
      const result = await getModelFromOPFS('owner', 'repo', 'branch', 'path/to/file.ifc')

      // Assert the expected outcomes
      expect(result).toEqual(mockFile)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(OPFSService.opfsReadModel).toHaveBeenCalledWith('file.ifc') // Since you manipulate the filepath in the function
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalled()
    })
  })

  describe('downloadToOPFS', () => {
    it('should resolve with file when download completes', async () => {
      const mockFile = new Blob(['dummy content'], { type: 'application/octet-stream' })
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          process.nextTick(() => {
            handler({ data: { completed: true, event: 'download', file: mockFile } })
          })
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const onProgressMock = mock()
      const result = await downloadToOPFS(
          'objectUrl',
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
          onProgressMock,
      )

      expect(result).toEqual(mockFile)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(OPFSService.opfsDownloadToOPFS).toHaveBeenCalledWith(
          'objectUrl',
          'commitHash',
          'originalFilePath',
          'owner',
          'repo',
          'branch',
          true, // Since onProgress is provided
      )
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(1) // Ensure it's called to clean up
    })

    it('should call onProgress with progress data', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          process.nextTick(() => {
            handler({ data: { progressEvent: true, total: 100, loaded: 50 } }) // Simulate a progress update
            handler({ data: { completed: true, event: 'download', file: new Blob(['content']) } }) // Then complete
          })
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const onProgressMock = mock()
      await downloadToOPFS(
          'objectUrl',
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
          onProgressMock,
      )

      expect(onProgressMock).toHaveBeenCalledWith({
        lengthComputable: true,
        total: 100,
        loaded: 50,
      })
    })
  })

  describe('downloadModel', () => {
    it('should resolve with file when download completes', async () => {
      const mockFile = new Blob(['dummy content'], { type: 'application/octet-stream' })
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          process.nextTick(() => {
            handler({ data: { completed: true, event: 'exists', file: mockFile } })
          })
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const onProgressMock = mock()
      const setOPFSFile = mock()
      const result = await downloadModel(
          'objectUrl',
          'shaHash',
          'originalFilePath',
          'accessToken',
          'owner',
          'repo',
          'branch',
          setOPFSFile,
          onProgressMock,
      )

      expect(result).toEqual(mockFile)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(OPFSService.opfsDownloadModel).toHaveBeenCalledWith(
          'objectUrl',
          'shaHash',
          'originalFilePath',
          'owner',
          'repo',
          'branch',
          'accessToken',
          true, // Since onProgress is provided
      )
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(1) // Ensure it's called to clean up
    })

    it('should call onProgress with progress data', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          process.nextTick(() => {
            handler({ data: { progressEvent: true, contentLength: 100, receivedLength: 50 } }) // Simulate a progress update
            handler({ data: { completed: true, event: 'download', file: new Blob(['content']) } }) // Then download
            handler({ data: { completed: true, event: 'renamed', file: new Blob(['content']) } }) // Then complete
          })
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const onProgressMock = mock()
      const setOPFSFile = mock()
      await downloadModel(
          'objectUrl',
          'shaHash',
          'originalFilePath',
          'accessToken',
          'owner',
          'repo',
          'branch',
          setOPFSFile,
          onProgressMock,
      )

      expect(onProgressMock).toHaveBeenCalledWith({
        lengthComputable: true,
        contentLength: 100,
        receivedLength: 50,
      })
    })
  })

  describe('doesFileExistInOPFS', () => {
    it('should resolve true if the file exists', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          process.nextTick(() => handler({ data: { completed: true, event: 'exist' } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const result = await doesFileExistInOPFS(
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
      )

      expect(result).toBe(true)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(OPFSService.opfsDoesFileExist).toHaveBeenCalledWith(
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
      )
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(1) // Ensure it's called to clean up
    })

    it('should resolve false if the file does not exist', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          process.nextTick(() => handler({ data: { completed: true, event: 'notexist' } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const result = await doesFileExistInOPFS(
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
      )

      expect(result).toBe(false)
    })
  })

  describe('deleteFileFromOPFS', () => {
    it('should resolve true if the file was successfully deleted', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          // Simulate successful file deletion
          process.nextTick(() => handler({ data: { completed: true, event: 'deleted' } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const result = await deleteFileFromOPFS(
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
      )

      expect(result).toBe(true)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(OPFSService.opfsDeleteModel).toHaveBeenCalledWith(
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
      )
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(1)
    })

    it('should resolve false if the file does not exist', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          // Simulate the file not existing
          process.nextTick(() => handler({ data: { completed: true, event: 'notexist' } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const result = await deleteFileFromOPFS(
          'originalFilePath',
          'commitHash',
          'owner',
          'repo',
          'branch',
      )

      expect(result).toBe(false)
    })
  })

  describe('checkOPFSAvailability', () => {
    // Backup original window object
    const originalWindow = global.window

    beforeEach(() => {
      // Ensure a clean slate for window before each test
      delete global.window.FileSystemDirectoryHandle
    })

    afterAll(() => {
      // Restore original window object
      global.window = originalWindow
    })

    it('should return true when FileSystemDirectoryHandle is available', async () => {
      // Ensure FileSystemDirectoryHandle is available
      global.window.FileSystemDirectoryHandle = {}

      // Mock navigator.storage.getDirectory to simulate a successful call
      const mockGetDirectory = mock()
      global.navigator.storage = {
        getDirectory: mockGetDirectory,
      }
      mockGetDirectory.mockResolvedValue({}) // Simulate successful directory access

      const result = await checkOPFSAvailability()
      expect(result).toBe(true)
    })


    it('should return false when FileSystemDirectoryHandle is not available', async () => {
      // Ensure FileSystemDirectoryHandle is not defined
      delete global.window.FileSystemDirectoryHandle

      const result = await checkOPFSAvailability()
      expect(result).toBe(false)
    })
  })

  describe('snapshotOPFS', () => {
    it('should resolve true if the snapshot was retrieved', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          // Simulate successful file deletion
          process.nextTick(() => handler({ data: { completed: true, event: 'snapshot', directoryStructure: [] } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const result = await snapshotOPFS()

      expect(result).toBe(true)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearOPFS', () => {
    it('should resolve true if the OPFS cache was cleared', async () => {
      const mockWorker = {
        addEventListener: mock((_, handler) => {
          // Simulate successful file deletion
          process.nextTick(() => handler({ data: { completed: true, event: 'clear' } }))
        }),
        removeEventListener: mock(),
      }
      OPFSService.initializeWorker.mockReturnValue(mockWorker)

      const result = await clearOPFSCache()

      expect(result).toBe(true)
      expect(OPFSService.initializeWorker).toHaveBeenCalled()
      expect(mockWorker.addEventListener).toHaveBeenCalled()
      expect(mockWorker.removeEventListener).toHaveBeenCalledTimes(1)
    })
  })
})
