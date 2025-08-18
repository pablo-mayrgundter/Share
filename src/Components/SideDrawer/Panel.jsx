import React from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { assertDefined } from '../../utils/assert'
import { useIsMobile } from '../Hooks'
import PanelTitle, { PANEL_TITLE_HEIGHT } from './PanelTitle'


/**
 * A panel component with a sticky header containing a title and close button
 *
 * @property {string|React.ReactElement} title The title to display in the panel header
 * @property {Function} onClose A callback to be executed when the close button is clicked
 * @property {React.ReactNode} children Enclosed elements
 * @property {React.ReactElement} [actions] Actions component, for the top bar
 * @property {string} [data-testid] Set on the root Paper element
 * @return {React.ReactElement}
 */
export default function Panel({ title, onClose, children, actions = null, ...props }) {
  assertDefined(title, onClose, children)
  const isMobile = useIsMobile()
  return (
    <Box
      sx={{ height: '100%', overflow: 'hidden' }}
      data-testid={props['data-testid'] || `PanelBox-${title}`}
      role='region'
      {...props}
    >
      <PanelTitle
        title={title}
        onClose={onClose}
        actions={actions}
      />
      <Paper
        elevation={1}
        sx={{
          padding: '0.5em',
          // This ensures the overflowY scroll for the content doesn't underflow this title.
          height: `calc(100% - ${PANEL_TITLE_HEIGHT})`,
          overflow: 'auto',
          ...(isMobile ? {
            borderRadius: 0,
          } : {}),
        }}
        data-testid={`SideDrawerPanel-Paper-${title}`}
      >
        {children}
      </Paper>
    </Box>
  )
}
