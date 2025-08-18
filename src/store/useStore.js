import create from 'zustand'
import createAppsSlice from './AppsSlice'
import createBrowserSlice from './BrowserSlice'
import createCutPlanesSlice from './CutPlanesSlice'
import createIFCSlice from './IFCSlice'
import createIsolatorSlice from './IfcIsolatorSlice'
import createNavTreeSlice from './NavTreeSlice'
import createNotesSlice from './NotesSlice'
import createOpenSlice from './OpenSlice'
import createPropertiesSlice from './PropertiesSlice'
import createRepositorySlice from './RepositorySlice'
import createSearchSlice from './SearchSlice'
import createShareSlice from './ShareSlice'
import createSideDrawerSlice from './SideDrawerSlice'
import createUIEnabledSlice from './UIEnabledSlice'
import createUISlice from './UISlice'
import createVersionsSlice from './VersionsSlice'


const useStore = create((set, get) => ({
  ...createAppsSlice(set, get),
  ...createBrowserSlice(set, get),
  ...createCutPlanesSlice(set, get),
  ...createIFCSlice(set, get),
  ...createIsolatorSlice(set, get),
  ...createNavTreeSlice(set, get),
  ...createNotesSlice(set, get),
  ...createOpenSlice(set, get),
  ...createPropertiesSlice(set, get),
  ...createRepositorySlice(set, get),
  ...createShareSlice(set, get),
  ...createSearchSlice(set, get),
  ...createSideDrawerSlice(set, get),
  ...createUIEnabledSlice(set, get),
  ...createUISlice(set, get),
  ...createVersionsSlice(set, get),
  
  // Test helper to reset all state to initial values
  resetStore: () => {
    // Create fresh slices to get initial values, then extract only data properties
    const freshState = {
      ...createAppsSlice(() => {}, () => {}),
      ...createBrowserSlice(() => {}, () => {}),
      ...createCutPlanesSlice(() => {}, () => {}),
      ...createIFCSlice(() => {}, () => {}),
      ...createIsolatorSlice(() => {}, () => {}),
      ...createNavTreeSlice(() => {}, () => {}),
      ...createNotesSlice(() => {}, () => {}),
      ...createOpenSlice(() => {}, () => {}),
      ...createPropertiesSlice(() => {}, () => {}),
      ...createRepositorySlice(() => {}, () => {}),
      ...createShareSlice(() => {}, () => {}),
      ...createSearchSlice(() => {}, () => {}),
      ...createSideDrawerSlice(() => {}, () => {}),
      ...createUIEnabledSlice(() => {}, () => {}),
      ...createUISlice(() => {}, () => {}),
      ...createVersionsSlice(() => {}, () => {}),
    }
    
    // Only reset data properties, not functions
    const resetData = {}
    Object.keys(freshState).forEach(key => {
      if (typeof freshState[key] !== 'function') {
        resetData[key] = freshState[key]
      }
    })
    
    set(resetData, false) // Merge to keep existing functions
  },
}))

export default useStore
