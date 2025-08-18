import React, {} from 'react'
import Grid from '@mui/material/Unstable_Grid2'
import useStore from '../../store/useStore'
import AppEntry from './AppEntry'
import AppsRegistry from './AppsRegistry.json'


/** @return {React.ReactElement} */
export default function AppsListing() {
  const setSelectedApp = useStore((state) => state.setSelectedApp)
  return (
    <Grid container spacing={1}>
      {AppsRegistry.map((itemJson, index) => (
        <Grid xs={6} sm={6} md={6} key={index}>
          <AppEntry
            onClickCb={() => setSelectedApp(itemJson)}
            itemJson={itemJson}
          />
        </Grid>
      ))}
    </Grid>
  )
}
