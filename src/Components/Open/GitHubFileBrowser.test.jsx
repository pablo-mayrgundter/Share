import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { render } from '@testing-library/react'
import GitHubFileBrowser from './GitHubFileBrowser'


describe('GitHubFileBrowser', () => {
  const orgNamesArr = ['org1', 'org2']
  const user = { nickname: 'cypressTester' }
  const navigate = mock()

  it('renders all the UI elements', () => {
    const { getByText, getByLabelText } = render(<GitHubFileBrowser navigate={navigate} orgNamesArr={orgNamesArr} user={user}/>)
    expect(getByText(/Browse files on Github/i)).toBeInTheDocument()
    expect(getByLabelText(/Organization/i)).toBeInTheDocument()
    expect(getByLabelText(/Repository/i)).toBeInTheDocument()
    expect(getByLabelText(/Branch/i)).toBeInTheDocument()
    expect(getByLabelText(/Folder/i)).toBeInTheDocument()
    expect(getByLabelText(/File/i)).toBeInTheDocument()
  })
})
