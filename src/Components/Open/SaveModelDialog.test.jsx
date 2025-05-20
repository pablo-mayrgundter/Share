import React from 'react'
import {render, screen, fireEvent, waitFor} from '@testing-library/react'
import '@testing-library/jest-dom'
import {useAuth0} from '../../Auth0/Auth0Proxy'
import {getFilesAndFolders} from '../../net/github/Files'
import {getRepositories, getUserRepositories} from '../../net/github/Repositories'
import useStore from '../../store/useStore'
import SaveModelDialog from './SaveModelDialog'


// Mock the Auth0 hook
jest.mock('../../Auth0/Auth0Proxy', () => ({
  useAuth0: jest.fn(),
}))

// Mock the store
jest.mock('../../store/useStore', () => jest.fn())

// Mock the GitHub API calls
jest.mock('../../net/github/Files', () => ({
  getFilesAndFolders: jest.fn(),
  commitFile: jest.fn(),
}))

jest.mock('../../net/github/Repositories', () => ({
  getRepositories: jest.fn(),
  getUserRepositories: jest.fn(),
}))

describe('SaveModelDialog', () => {
  const mockSetIsDialogDisplayed = jest.fn()
  const mockNavigate = jest.fn()
  const mockSetSnackMessage = jest.fn()
  const mockAccessToken = 'mock-token'
  const mockFile = new File(['test content'], 'test.ifc', {type: 'text/plain'})

  const defaultProps = {
    isDialogDisplayed: true,
    setIsDialogDisplayed: mockSetIsDialogDisplayed,
    navigate: mockNavigate,
    orgNamesArr: ['test-org', 'user-org'],
  }

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Setup Auth0 mock
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      user: {nickname: 'user-org'},
    })

    // Setup store mock
    useStore.mockImplementation((selector) => {
      const state = {
        accessToken: mockAccessToken,
        isOpfsAvailable: true,
        opfsFile: mockFile,
        setSnackMessage: mockSetSnackMessage,
      }
      return selector(state)
    })

    // Setup GitHub API mocks
    getRepositories.mockResolvedValue({
      repo1: {name: 'repo1'},
      repo2: {name: 'repo2'},
    })

    getUserRepositories.mockResolvedValue({
      'user-repo1': {name: 'user-repo1'},
      'user-repo2': {name: 'user-repo2'},
    })

    getFilesAndFolders.mockResolvedValue({
      files: [
        {name: 'file1.ifc'},
        {name: 'file2.ifc'},
      ],
      directories: [
        {name: 'folder1'},
        {name: 'folder2'},
      ],
    })
  })

  it('renders login prompt when not authenticated', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      user: null,
    })

    render(<SaveModelDialog {...defaultProps}/>)
    expect(screen.getByText(/Please login/i)).toBeInTheDocument()
  })

  it('renders organization selector when authenticated', () => {
    render(<SaveModelDialog {...defaultProps}/>)
    expect(screen.getByText(/Organization/i)).toBeInTheDocument()
    expect(screen.getByTestId('saveOrganization')).toBeInTheDocument()
  })

  it('loads repositories when organization is selected', async () => {
    render(<SaveModelDialog {...defaultProps}/>)

    // Select organization
    const orgSelector = screen.getByTestId('saveOrganization')
    fireEvent.click(orgSelector)
    fireEvent.click(screen.getByText('@test-org'))

    // Wait for repositories to load
    await waitFor(() => {
      expect(getRepositories).toHaveBeenCalledWith('test-org', mockAccessToken)
    })

    // Check if repository selector is populated
    expect(screen.getByText(/Repository/i)).toBeInTheDocument()
    expect(screen.getByTestId('saveRepository')).toBeInTheDocument()
  })

  it('loads files and folders when repository is selected', async () => {
    render(<SaveModelDialog {...defaultProps}/>)

    // Select organization first
    const orgSelector = screen.getByTestId('saveOrganization')
    fireEvent.click(orgSelector)
    fireEvent.click(screen.getByText('@test-org'))

    // Wait for repositories to load
    await waitFor(() => {
      expect(getRepositories).toHaveBeenCalled()
    })

    // Select repository
    const repoSelector = screen.getByTestId('saveRepository')
    fireEvent.click(repoSelector)
    fireEvent.click(screen.getByText('repo1'))

    // Wait for files and folders to load
    await waitFor(() => {
      expect(getFilesAndFolders).toHaveBeenCalledWith(
        'repo1',
        'test-org',
        '/',
        mockAccessToken,
      )
    })

    // Check if folder selector is populated
    expect(screen.getByText(/Folder/i)).toBeInTheDocument()
    expect(screen.getByTestId('saveFolder')).toBeInTheDocument()
  })

  it('shows create folder input when "Create a folder" is selected', async () => {
    render(<SaveModelDialog {...defaultProps}/>)

    // Select organization and repository first
    const orgSelector = screen.getByTestId('saveOrganization')
    fireEvent.click(orgSelector)
    fireEvent.click(screen.getByText('@test-org'))

    await waitFor(() => {
      expect(getRepositories).toHaveBeenCalled()
    })

    const repoSelector = screen.getByTestId('saveRepository')
    fireEvent.click(repoSelector)
    fireEvent.click(screen.getByText('repo1'))

    // Wait for files and folders to load
    await waitFor(() => {
      expect(getFilesAndFolders).toHaveBeenCalled()
    })

    // Select "Create a folder"
    const folderSelector = screen.getByTestId('saveFolder')
    fireEvent.click(folderSelector)
    fireEvent.click(screen.getByText('Create a folder'))

    // Check if folder creation input is shown
    expect(screen.getByLabelText(/Enter folder name/i)).toBeInTheDocument()
  })

  it('enables save button when all required fields are filled', async () => {
    render(<SaveModelDialog {...defaultProps}/>)

    // Select organization
    const orgSelector = screen.getByTestId('saveOrganization')
    fireEvent.click(orgSelector)
    fireEvent.click(screen.getByText('@test-org'))

    // Select repository
    const repoSelector = screen.getByTestId('saveRepository')
    fireEvent.click(repoSelector)
    fireEvent.click(screen.getByText('repo1'))

    // Enter file name
    const fileNameInput = screen.getByLabelText(/Enter file name/i)
    fireEvent.change(fileNameInput, {target: {value: 'test.ifc'}})

    // Check if save button is enabled
    expect(screen.getByText('Save model')).toBeEnabled()
  })

  it('shows extended features when .gitattributes file is present', async () => {
    // Mock the presence of .gitattributes file
    getFilesAndFolders.mockResolvedValueOnce({
      files: [
        {name: '.gitattributes'},
        {name: 'file1.ifc'},
      ],
      directories: [
        {name: 'folder1'},
      ],
    })

    render(<SaveModelDialog {...defaultProps}/>)

    // Select organization and repository
    const orgSelector = screen.getByTestId('saveOrganization')
    fireEvent.click(orgSelector)
    fireEvent.click(screen.getByText('@test-org'))

    const repoSelector = screen.getByTestId('saveRepository')
    fireEvent.click(repoSelector)
    fireEvent.click(screen.getByText('repo1'))

    // Wait for files to load
    await waitFor(() => {
      expect(getFilesAndFolders).toHaveBeenCalled()
    })

    // Check for extended features UI elements
    // Note: These assertions will need to be updated once the actual UI elements are added
    expect(screen.getByText(/Extended Features/i)).toBeInTheDocument()
    expect(screen.getByTestId('extended-features-checkbox')).toBeInTheDocument()
  })
})
