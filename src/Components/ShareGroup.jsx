import React from 'react'
import {makeStyles} from '@mui/styles'
import CameraControl from './CameraControl'
import IssuesControl from './IssuesControl'
import ShareDialogControl from './ShareDialog'


/**
 * ShareGoup contains tools for issues and sharing
 *
 * @param {Object} viewer The IFC viewer
 * @return {Object}
 */
export default function ShareGroup({viewer}) {
  const classes = useStyles()
  return (
    <div>
      {viewer &&
        <div className={classes.container}>
          <ShareDialogControl viewer={viewer} />
          <IssuesControl viewer={viewer} />
          <CameraControl camera={viewer.IFC.context.ifcCamera.cameraControls} />
        </div>
      }
    </div>
  )
}


const useStyles = makeStyles((theme) => ({
  container: {
    'width': '80px',
    'display': 'flex',
    'flexDirection': 'column',
    'justifyContent': 'space-between',
    'alignItems': 'center',
    'zIndex': 10,
    '@media (max-width: 900px)': {
      'width': '10px',
      'flexDirection': 'column',
      'justifyContent': 'space-between',
    },
  },
}))

