// CustomTableRow.test.js
import { describe, it, expect, test } from 'bun:test'
import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import CustomTableRow from './TableRow'


describe('<CustomTableRow />', () => {
  test('renders heading and subtext', () => {
    const { getByText } = render(<CustomTableRow heading="Test Heading" subtext="Test Subtext"/>)
    expect(getByText('Test Heading')).toBeInTheDocument()
    expect(getByText('Test Subtext')).toBeInTheDocument()
  })

  test('shows input field when edit button is clicked', () => {
    const { getByRole, getByDisplayValue } = render(<CustomTableRow heading="Test Heading" subtext="Test Subtext"/>)
    fireEvent.click(getByRole('button')) // Click the edit button
    expect(getByDisplayValue('Test Subtext')).toBeInTheDocument()
  })

  it('switches to select editing mode', () => {
    const { getByTestId, getByRole } = render(
        <CustomTableRow heading="Test Heading" subtext="Option 1" inputType="select" options={['Option 1', 'Option 2']}/>,
    )

    fireEvent.click(getByRole('button')) // Click the edit button

    const select = getByTestId('select')
    expect(select).toBeInTheDocument()
  })

  test('changes input value when typed', async () => {
    const { getByRole, getByDisplayValue } = render(<CustomTableRow heading="Test Heading" subtext="Test Subtext"/>)

    // Enter editing mode
    await act(() => {
      fireEvent.click(getByRole('button')) // Click the edit button
    })

    // Update the input value and verify it changed
    const inputField = getByDisplayValue('Test Subtext')
    await act(() => {
      fireEvent.change(inputField, { target: { value: 'Updated Text' } })
    })

    // Verify the input value was updated
    expect(getByDisplayValue('Updated Text')).toBeInTheDocument()
  })
})
