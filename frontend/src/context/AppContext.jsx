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
    const [token, setToken] = useState('')
    const [userData, setUserData] = useState(false)
    const [initializing, setInitializing] = useState(true)

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
        // if the URL contains ?forceLogin=1, clear any stored token and skip verification
        const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
        if (params && params.get('forceLogin') === '1') {
            localStorage.removeItem('token')
            setToken('')
            setInitializing(false)
            return
        }

        if (token) {
            loadUserProfileData()
            setInitializing(false)
            return
        }

        // verify stored token on mount
        const verifyStored = async () => {
            const stored = localStorage.getItem('token')
            if (!stored) {
                setInitializing(false)
                return
            }
            try {
                const backendUrl = getBackendUrl()
                const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, { headers: { token: stored } })
                if (data && data.success) {
                    setToken(stored)
                    setUserData(data.userData)
                } else {
                    localStorage.removeItem('token')
                }
            } catch (error) {
                localStorage.removeItem('token')
            } finally {
                setInitializing(false)
            }
        }

        verifyStored()
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
        initializing,
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