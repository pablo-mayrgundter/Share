import React, {ReactElement, useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth0} from '../../Auth0/Auth0Proxy'
import {getOrganizations} from '../../net/github/Organizations'
import useStore from '../../store/useStore'
import {ControlButton} from '../Buttons'
import SaveModelDialog from './SaveModelDialog'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'


/**
 * Displays model save dialog
 *
 * @return {ReactElement}
 */
export default function SaveModelControl() {
  const isSaveModelVisible = useStore((state) => state.isSaveModelVisible)
  const setIsSaveModelVisible = useStore((state) => state.setIsSaveModelVisible)

  const {user} = useAuth0()
  const navigate = useNavigate()
  const accessToken = useStore((state) => state.accessToken)
  const [orgNamesArr, setOrgNamesArray] = useState([''])


  useEffect(() => {
    /** @return {Array<string>} organizations */
    async function fetchOrganizations() {
      const orgs = await getOrganizations(accessToken)
      const orgNamesFetched = Object.keys(orgs).map((key) => orgs[key].login)
      const orgNames = [...orgNamesFetched, user && user.nickname]
      setOrgNamesArray(orgNames)
      return orgs
    }

    if (isSaveModelVisible && accessToken) {
      fetchOrganizations()
    }
  }, [isSaveModelVisible, accessToken, user])


  return (
    <ControlButton
      title='Save'
      isDialogDisplayed={isSaveModelVisible}
      setIsDialogDisplayed={setIsSaveModelVisible}
      icon={<SaveOutlinedIcon className='icon-share'/>}
      placement='bottom'
    >
      <SaveModelDialog
        isDialogDisplayed={isSaveModelVisible}
        setIsDialogDisplayed={setIsSaveModelVisible}
        navigate={navigate}
        orgNamesArr={orgNamesArr}
      />
    </ControlButton>
  )
}
