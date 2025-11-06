import axios from 'axios'
import PropTypes from 'prop-types'
import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'

export const AppContext = createContext()

const AppContextProvider = (props) => {

    const currencySymbol = '₹'
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim().replace(/\/+$/, '')

    const [doctors, setDoctors] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : '')
    const [userData, setUserData] = useState(false)

    // Getting Doctors using API
    const getDoctosData = useCallback(async () => {

        try {

            if (!backendUrl) {
                toast.error('Backend URL is not configured. Please set VITE_BACKEND_URL in your environment file.')
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

    }, [backendUrl])

    // Getting User Profile using API
    const loadUserProfileData = useCallback(async () => {

        try {

            if (!backendUrl) {
                toast.error('Backend URL is not configured. Please set VITE_BACKEND_URL in your environment file.')
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

    }, [backendUrl, token])

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
        backendUrl,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
    }), [backendUrl, currencySymbol, doctors, getDoctosData, loadUserProfileData, token, userData])

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