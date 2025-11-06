import axios from 'axios'
import PropTypes from 'prop-types'
import { createContext, useCallback, useMemo, useState } from 'react'
import { toast } from 'react-toastify'


export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '')

    const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(null)
    const [profileData, setProfileData] = useState(false)
    const [consultationCache, setConsultationCache] = useState({})

    // Getting Doctor appointment data from Database using API
    const getAppointments = useCallback(async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }
    }, [backendUrl, dToken])

    // Getting Doctor profile data from Database using API
    const getProfileData = useCallback(async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            setProfileData(data.profileData)

        } catch (error) {
            toast.error(error.message)
        }
    }, [backendUrl, dToken])

    // Getting Doctor dashboard data using API
    const getDashData = useCallback(async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
                return true
            } else {
                toast.error(data.message)
                setDashData(null)
            }

        } catch (error) {
            toast.error(error.message)
            setDashData(null)
        }
        return false
    }, [backendUrl, dToken])

    // Function to cancel doctor appointment using API
    const cancelAppointment = useCallback(async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                // after creating dashboard
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }, [backendUrl, dToken, getAppointments, getDashData])

    // Function to Mark appointment completed using API
    const ensureConsultation = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/consultations/doctor/schedule`,
                { appointmentId },
                { headers: { dToken } },
            )

            if (data.success) {
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                return data.consultation
            }

            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [backendUrl, dToken])

    const startConsultation = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/consultations/doctor/start`,
                { appointmentId },
                { headers: { dToken } },
            )

            if (data.success) {
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                return data.consultation
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [backendUrl, dToken])

    const getConsultationDetails = useCallback(async (appointmentId) => {
        try {
            const cached = consultationCache[appointmentId]
            if (cached) return cached

            const { data } = await axios.post(
                `${backendUrl}/api/consultations/doctor/details`,
                { appointmentId },
                { headers: { dToken } },
            )

            if (data.success) {
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                return data.consultation
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [backendUrl, consultationCache, dToken])

    const completeConsultation = useCallback(async ({ appointmentId, summary, followUpDate, notesForPatient, notesForInternal }) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/consultations/doctor/complete`,
                { appointmentId, summary, followUpDate, notesForPatient, notesForInternal },
                { headers: { dToken } },
            )

            if (data.success) {
                toast.success('Consultation saved')
                setConsultationCache((prev) => ({ ...prev, [appointmentId]: data.consultation }))
                getAppointments()
                getDashData()
                return true
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return false
    }, [backendUrl, dToken, getAppointments, getDashData])

    const uploadLabReport = useCallback(async ({ appointmentId, title, description, file }) => {
        try {
            const formData = new FormData()
            formData.append('appointmentId', appointmentId)
            formData.append('title', title)
            if (description) formData.append('description', description)
            if (file) formData.append('report', file)

            const { data } = await axios.post(
                `${backendUrl}/api/records/doctor/lab-report`,
                formData,
                {
                    headers: {
                        dToken,
                        'Content-Type': 'multipart/form-data',
                    },
                },
            )

            if (data.success) {
                toast.success('Lab report shared with patient')
                return data.report
            }

            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [backendUrl, dToken])

    const getAppointmentRecords = useCallback(async (appointmentId) => {
        try {
            const { data } = await axios.get(
                `${backendUrl}/api/records/doctor/appointment/${appointmentId}`,
                { headers: { dToken } },
            )

            if (data.success) {
                return data
            }
            toast.error(data.message)
        } catch (error) {
            toast.error(error.message)
        }
        return null
    }, [backendUrl, dToken])

    const value = useMemo(() => ({
        dToken,
        setDToken,
        backendUrl,
        appointments,
        getAppointments,
        cancelAppointment,
        ensureConsultation,
        startConsultation,
        getConsultationDetails,
        completeConsultation,
        uploadLabReport,
        getAppointmentRecords,
        dashData,
        getDashData,
        profileData,
        setProfileData,
        getProfileData,
    }), [appointments, backendUrl, cancelAppointment, completeConsultation, dashData, dToken, ensureConsultation, getAppointmentRecords, getAppointments, getConsultationDetails, getDashData, getProfileData, profileData, startConsultation, uploadLabReport])

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )


}

export default DoctorContextProvider

DoctorContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
}