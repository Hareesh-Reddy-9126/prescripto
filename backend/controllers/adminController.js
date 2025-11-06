import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import { v2 as cloudinary } from "cloudinary";
import userModel from "../models/userModel.js";
import pharmacyModel from "../models/pharmacyModel.js";
import pharmacyOrderModel from "../models/pharmacyOrderModel.js";
import { notifyPharmacist, notifyPatient } from "../utils/notificationService.js";
import settingsModel from "../models/settingsModel.js";

// API for admin login
const loginAdmin = async (req, res) => {
    try {

        const { email, password } = req.body

        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET)
            res.json({ success: true, token })
        } else {
            res.json({ success: false, message: "Invalid credentials" })
        }

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}


// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
    try {

        const appointments = await appointmentModel.find({})
        res.json({ success: true, appointments })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for appointment cancellation
const appointmentCancel = async (req, res) => {
    try {

        const { appointmentId } = req.body
        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true })

        res.json({ success: true, message: 'Appointment Cancelled' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }

}

// API for adding Doctor
const addDoctor = async (req, res) => {

    try {

        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body
    const imageFile = req.file

        // checking for all data to add doctor
        if (!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({ success: false, message: "Missing Details" })
        }

        // validating email format
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" })
        }

        // validating strong password
        if (password.length < 8) {
            return res.json({ success: false, message: "Please enter a strong password" })
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt)

        let imageUrl = undefined
        try {
            if (imageFile) {
                // Attempt upload only if Cloudinary is configured
                if (cloudinary.config().cloud_name && cloudinary.config().api_key) {
                    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" })
                    imageUrl = imageUpload.secure_url
                } else {
                    console.warn('[cloudinary] Not configured; skipping image upload. The doctor will be created with a default image.')
                }
            }
        } catch (uploadErr) {
            console.warn('Cloudinary upload failed, proceeding without image:', uploadErr.message)
        }

        const doctorData = {
            name,
            email,
            ...(imageUrl ? { image: imageUrl } : {}),
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()
        res.json({ success: true, message: 'Doctor Added' })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get all doctors list for admin panel
const allDoctors = async (req, res) => {
    try {

        const doctors = await doctorModel.find({}).select('-password')
        res.json({ success: true, doctors })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get dashboard data for admin panel
const adminDashboard = async (req, res) => {
    try {

        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({})
        const pharmacies = await pharmacyModel.find({})
        const pharmacyOrders = await pharmacyOrderModel.find({})

        const dashData = {
            doctors: doctors.length,
            appointments: appointments.length,
            patients: users.length,
            pharmacies: pharmacies.length,
            pendingPharmacies: pharmacies.filter((pharmacy) => !pharmacy.isApproved).length,
            pharmacyOrders: pharmacyOrders.length,
            latestAppointments: appointments.slice().reverse(),
            latestPharmacyOrders: pharmacyOrders.slice().reverse().slice(0, 10)
        }

        res.json({ success: true, dashData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const listPharmacies = async (req, res) => {
    try {
        const { status } = req.query
        const filter = {}

        if (status === 'pending') {
            filter.isApproved = false
        } else if (status === 'approved') {
            filter.isApproved = true
        }

        const pharmacies = await pharmacyModel.find(filter).sort({ createdAt: -1 }).select(['-password'])
        res.json({ success: true, pharmacies })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const reviewPharmacy = async (req, res) => {
    try {
        const { pharmacyId, approve, notes } = req.body

        const pharmacy = await pharmacyModel.findById(pharmacyId)
        if (!pharmacy) {
            return res.json({ success: false, message: 'Pharmacy not found' })
        }

        pharmacy.isApproved = approve
        pharmacy.moderationNotes = notes
        pharmacy.approvedAt = approve ? new Date() : undefined
        pharmacy.isActive = approve ? true : false

        await pharmacy.save()

        await notifyPharmacist({
            pharmacyId,
            title: approve ? 'Pharmacy approved' : 'Pharmacy rejected',
            message: approve ? 'Your pharmacy account has been approved by admin.' : `Your pharmacy application requires changes: ${notes}`,
            metadata: { approval: approve }
        })

        res.json({ success: true, message: approve ? 'Pharmacy approved' : 'Pharmacy rejected', pharmacy })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const togglePharmacyActive = async (req, res) => {
    try {
        const { pharmacyId, isActive } = req.body

        const pharmacy = await pharmacyModel.findByIdAndUpdate(pharmacyId, { isActive }, { new: true })

        if (!pharmacy) {
            return res.json({ success: false, message: 'Pharmacy not found' })
        }

        await notifyPharmacist({
            pharmacyId,
            title: 'Account status updated',
            message: isActive ? 'Your pharmacy account has been reactivated.' : 'Your pharmacy account has been disabled by admin.',
            metadata: { isActive }
        })

        res.json({ success: true, message: 'Pharmacy status updated', pharmacy })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const adminPharmacyOrders = async (req, res) => {
    try {
        const { status, pharmacyId, userId } = req.query
        const filter = {}

        if (status) filter.status = status
        if (pharmacyId) filter.pharmacyId = pharmacyId
        if (userId) filter.userId = userId

        const orders = await pharmacyOrderModel
            .find(filter)
            .sort({ createdAt: -1 })
            .populate('pharmacyId', 'name email phone')
            .populate('userId', 'name email phone')

        res.json({ success: true, orders })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const adminUpdateOrderStatus = async (req, res) => {
    try {
        const { orderId, status, note } = req.body

        const order = await pharmacyOrderModel.findById(orderId)

        if (!order) {
            return res.json({ success: false, message: 'Order not found' })
        }

        order.status = status
        order.statusHistory.push({ status, note, updatedBy: 'admin', updatedById: 'admin', timestamp: new Date() })

        await order.save()

        await notifyPatient({
            userId: order.userId,
            title: 'Order status updated',
            message: `Your pharmacy order has been updated to ${status} by admin.`,
            metadata: { orderId: order._id, status }
        })

        await notifyPharmacist({
            pharmacyId: order.pharmacyId,
            title: 'Order status updated',
            message: `Order ${order.orderNumber} has been updated to ${status} by admin.`,
            metadata: { orderId: order._id, status }
        })

        res.json({ success: true, message: 'Order status updated', order })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const DEFAULT_PLATFORM_SETTINGS = {
    consultationFee: 499,
    cancellationWindowHours: 12,
    videoProvider: 'jitsi',
    emergencyContact: '',
    allowedDeliveryRadiusKm: 15,
    security: {
        enforceMfa: false,
        sessionTimeoutMinutes: 60,
    },
}

const getPlatformSettings = async (req, res) => {
    try {
        let settings = await settingsModel.findOne({ key: 'platform' })
        if (!settings) {
            settings = await settingsModel.create({ key: 'platform', value: DEFAULT_PLATFORM_SETTINGS })
        }

        res.json({ success: true, settings: { ...DEFAULT_PLATFORM_SETTINGS, ...(settings.value || {}) } })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

const updatePlatformSettings = async (req, res) => {
    try {
        const payload = {
            consultationFee: Number(req.body.consultationFee) || DEFAULT_PLATFORM_SETTINGS.consultationFee,
            cancellationWindowHours: Number(req.body.cancellationWindowHours) || DEFAULT_PLATFORM_SETTINGS.cancellationWindowHours,
            videoProvider: req.body.videoProvider || DEFAULT_PLATFORM_SETTINGS.videoProvider,
            emergencyContact: req.body.emergencyContact || DEFAULT_PLATFORM_SETTINGS.emergencyContact,
            allowedDeliveryRadiusKm: Number(req.body.allowedDeliveryRadiusKm) || DEFAULT_PLATFORM_SETTINGS.allowedDeliveryRadiusKm,
            security: {
                enforceMfa: Boolean(req.body.security?.enforceMfa ?? req.body.enforceMfa),
                sessionTimeoutMinutes: Number(req.body.security?.sessionTimeoutMinutes ?? req.body.sessionTimeoutMinutes) || DEFAULT_PLATFORM_SETTINGS.security.sessionTimeoutMinutes,
            },
        }

        const settings = await settingsModel.findOneAndUpdate(
            { key: 'platform' },
            { value: payload },
            { upsert: true, new: true, setDefaultsOnInsert: true },
        )

        res.json({ success: true, message: 'Settings updated', settings: settings.value })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

export {
    loginAdmin,
    appointmentsAdmin,
    appointmentCancel,
    addDoctor,
    allDoctors,
    adminDashboard,
    listPharmacies,
    reviewPharmacy,
    togglePharmacyActive,
    adminPharmacyOrders,
    adminUpdateOrderStatus,
    getPlatformSettings,
    updatePlatformSettings
}