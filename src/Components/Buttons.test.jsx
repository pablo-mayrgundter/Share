import { describe, it, expect, mock } from 'bun:test'
import React from 'react'
import { fireEvent, render, renderHook, act } from '@testing-library/react'
import { TooltipIconButton } from './Buttons'
import useStore from '../store/useStore'
import { ThemeCtx } from '../theme/Theme.fixture'
import QuestionIcon from '../assets/icons/Question.svg'


describe('TooltipIconButton', () => {
  it('should render successfully', async () => {
    const dataTestId = 'test-button'
    const cb = mock()
    const rendered = render(
      <TooltipIconButton
        title='Hello. Is it me ur looking for?'
        icon={<QuestionIcon/>}
        onClick={cb}
        placement='top'
        dataTestId={dataTestId}
      />,
      { wrapper: ThemeCtx })
    const button = await rendered.findByTestId(dataTestId)
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(cb).toHaveBeenCalled()
  })

  it('show tooltip when the help is activated', async () => {
    const { result } = renderHook(() => useStore((state) => state))
    await act(() => {
      result.current.setIsHelpTooltipsVisible(true)
    })
    const title = 'TestTooltip'
    const cb = mock()
    const { getByTestId } = render(
      <TooltipIconButton
        title={title}
        icon={<QuestionIcon/>}
        onClick={cb}
        placement='top'
      >
        Foo
      </TooltipIconButton>,
      { wrapper: ThemeCtx })
    expect(getByTestId(title)).toBeInTheDocument()
  })
})
