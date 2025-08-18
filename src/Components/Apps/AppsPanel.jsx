import React, {} from 'react'
import useStore from '../../store/useStore'
import Panel from '../SideDrawer/Panel'
import AppsListing from './AppsListing'
import { removeHashParams } from './hashState'


/** @return {React.ReactElement} */
export default function AppsPanel() {
  const setIsAppsVisible = useStore((state) => state.setIsAppsVisible)


  /** Hide panel and remove hash state */
  function onClose() {
    setIsAppsVisible(false)
    removeHashParams()
  }


  return (
    <Panel title='Apps' onClose={onClose} data-testid='AppsPanel'>
      <AppsListing/>
    </Panel>
  )
}
