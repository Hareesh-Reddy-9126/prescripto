import axios from 'axios'
import PropTypes from 'prop-types'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { getBackendUrl } from '../utils/runtimeConfig'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    // backendUrl will be resolved at runtime: prefer Vite build env, otherwise
    // read runtime deployed.json (set on window.__DEPLOYED by main.jsx)
    // Note: keep this local inside callbacks to reflect any runtime changes.

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    // Getting Doctors using API
    const getDoctosData = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            if (!backendUrl) {
                toast.error('Backend URL is not configured. Please set VITE_BACKEND_URL in your environment or provide deployed.json')
                return
            }

            const { data } = await axios.get(`${backendUrl}/api/doctor/list`)
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [])

    // Getting User Profile using API
    const loadUserProfileData = useCallback(async () => {
        try {
            const backendUrl = getBackendUrl()
            if (!backendUrl) {
                toast.error('Backend URL is not configured. Please set VITE_BACKEND_URL in your environment or provide deployed.json')
                return
            }

            const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, { headers: { token } })

            if (data.success) {
                setUserData(data.userData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [token])

    useEffect(() => {
        getDoctosData()
    }, [getDoctosData])

    useEffect(() => {
        if (token) {
            loadUserProfileData()
        }
    }, [token, loadUserProfileData])

    const value = useMemo(() => ({
        doctors,
        getDoctosData,
        currencySymbol,
        backendUrl: getBackendUrl(),
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
    }), [currencySymbol, doctors, getDoctosData, loadUserProfileData, token, userData])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider

AppContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}