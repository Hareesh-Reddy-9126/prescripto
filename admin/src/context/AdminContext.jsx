import axios from "axios";
import PropTypes from "prop-types";
import { createContext, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";


export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '')

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : '')

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [dashData, setDashData] = useState(null)
    const [pharmacies, setPharmacies] = useState({ pending: [], approved: [] })
    const [platformSettings, setPlatformSettings] = useState(null)

    // Getting all Doctors data from Database using API
    const getAllDoctors = useCallback(async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }, [aToken, backendUrl])

    // Function to change doctor availablity using API
    const changeAvailability = useCallback(async (docId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, backendUrl, getAllDoctors])


    // Getting all appointment data from Database using API
    const getAllAppointments = useCallback(async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }, [aToken, backendUrl])

    // Function to cancel appointment using API
    const cancelAppointment = useCallback(async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }, [aToken, backendUrl, getAllAppointments])

    // Getting Admin Dashboard data from Database using API
    const getDashData = useCallback(async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

            if (data.success) {
                setDashData(data.dashData)
                return true
            } else {
                toast.error(data.message)
                setDashData(null)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
            setDashData(null)
        }
        return false
    }, [aToken, backendUrl])

    // Pharmacies: list pending/approved
    const getPharmacies = useCallback(async (status) => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/pharmacies`, { params: { status }, headers: { aToken } })
            if (data.success) {
                if (status === 'pending') {
                    setPharmacies((p) => ({ ...p, pending: data.pharmacies }))
                } else if (status === 'approved') {
                    setPharmacies((p) => ({ ...p, approved: data.pharmacies }))
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, backendUrl])

    // Pharmacies: approve/reject
    const reviewPharmacy = useCallback(async ({ pharmacyId, approve, notes }) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/pharmacies/review`, { pharmacyId, approve, notes }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                await Promise.all([getPharmacies('pending'), getPharmacies('approved')])
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, backendUrl, getPharmacies])

    // Pharmacies: toggle active
    const togglePharmacyActive = useCallback(async ({ pharmacyId, isActive }) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/pharmacies/toggle-active`, { pharmacyId, isActive }, { headers: { aToken } })
            if (data.success) {
                toast.success('Pharmacy status updated')
                await getPharmacies('approved')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }, [aToken, backendUrl, getPharmacies])

    const loadPlatformSettings = useCallback(async () => {
        if (!aToken) return null
        try {
            const { data } = await axios.get(`${backendUrl}/api/admin/settings`, { headers: { aToken } })
            if (data.success) {
                setPlatformSettings(data.settings)
                return data.settings
            }
            toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        return null
    }, [aToken, backendUrl])

    const savePlatformSettings = useCallback(async (payload) => {
        if (!aToken) return false
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/settings`, payload, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                setPlatformSettings(data.settings)
                return true
            }
            toast.error(data.message)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
        return false
    }, [aToken, backendUrl])

    const value = useMemo(() => ({
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
        pharmacies,
        getPharmacies,
        reviewPharmacy,
        togglePharmacyActive,
        platformSettings,
        loadPlatformSettings,
        savePlatformSettings
    }), [aToken, appointments, cancelAppointment, changeAvailability, dashData, doctors, getAllAppointments, getAllDoctors, getDashData, getPharmacies, loadPlatformSettings, pharmacies, platformSettings, reviewPharmacy, savePlatformSettings, togglePharmacyActive])

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider

AdminContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}