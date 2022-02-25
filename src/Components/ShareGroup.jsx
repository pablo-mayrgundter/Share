import React from 'react'
import {makeStyles} from '@mui/styles'
import CameraControl from './CameraControl'
import IssuesControl from './IssuesControl'
import ShareDialogControl from './ShareDialog'


/**
 * OperationsGroup contains tools for cut plane, deselecting items and
 * toggling shortcut visibility
 *
 * @param {Object} viewer The IFC viewer
 * @param {function} placeCutPlane places cut plances for mobile devices
 * @param {function} unSelectItem deselects currently selected element
 * @return {Object}
 */
export default function ShareGroup({viewer, placeCutPlane, unSelectItem}) {
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
  icon: {
    width: '30px',
    height: '30px',
    cursor: 'pointer',
  },
}))

