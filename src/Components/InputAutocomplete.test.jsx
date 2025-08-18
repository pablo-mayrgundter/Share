import { describe, it, expect } from 'bun:test'
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import InputAutocomplete from './InputAutocomplete' // Adjust the import path


describe('InputAutocomplete', () => {
  const elements = [
    { title: 'Option 1' },
    { title: 'Option 2' },
    { title: 'Option 3' },
  ]

  it('renders the input with placeholder', () => {
    const placeholderText = 'Type something'
    const { getByPlaceholderText } = render(
        <InputAutocomplete elements={elements} placeholder={placeholderText}/>,
    )
    const inputElement = getByPlaceholderText(placeholderText)
    expect(inputElement).toBeInTheDocument()
  })

  it('displays suggestions when typing', async () => {
    const { getByText, getByRole } = render(
        <InputAutocomplete elements={elements} placeholder="Type something"/>,
    )

    // Click the dropdown arrow button to open suggestions
    const dropdownButton = getByRole('button', { name: 'Open' })
    fireEvent.click(dropdownButton)

    // Wait for suggestions to appear
    await waitFor(() => {
      expect(getByText('Option 1')).toBeInTheDocument()
    })

    expect(getByText('Option 2')).toBeInTheDocument()
    expect(getByText('Option 3')).toBeInTheDocument()
  })
})
