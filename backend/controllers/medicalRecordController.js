import { v2 as cloudinary } from 'cloudinary'
import appointmentModel from '../models/appointmentModel.js'
import labReportModel from '../models/labReportModel.js'
import pharmacyOrderModel from '../models/pharmacyOrderModel.js'
import prescriptionModel from '../models/prescriptionModel.js'
import { notifyPatient } from '../utils/notificationService.js'

const isCloudinaryConfigured = () => {
  const config = cloudinary.config()
  return Boolean(config?.cloud_name && config?.api_key && config?.api_secret)
}

const uploadLabReport = async (req, res) => {
  try {
    const { appointmentId, title, description } = req.body
    const { docId } = req.body
    const file = req.file

    if (!appointmentId || !title) {
      return res.json({ success: false, message: 'Appointment and title are required' })
    }

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(docId)) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    let fileUrl

    if (file) {
      try {
        if (isCloudinaryConfigured()) {
          const uploadResult = await cloudinary.uploader.upload(file.path, { resource_type: 'auto', folder: 'prescripto/lab-reports' })
          fileUrl = uploadResult.secure_url
        } else {
          fileUrl = file.path
        }
      } catch (uploadError) {
        console.warn('Lab report upload failed, storing local path instead:', uploadError.message)
        fileUrl = file.path
      }
    }

    const report = await labReportModel.create({
      appointmentId,
      userId: appointment.userId,
      docId,
      title,
      description,
      fileUrl,
      uploadedBy: 'doctor',
      metadata: file ? { mimetype: file.mimetype, size: file.size } : undefined,
    })

    await notifyPatient({
      userId: appointment.userId,
      title: 'New lab report shared',
      message: `${title} is now available in your health records.`,
      metadata: { appointmentId: appointment._id, reportId: report._id },
    })

    return res.json({ success: true, report })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

const listPatientRecords = async (req, res) => {
  try {
  const userId = req.userId || req.body.userId

    const [appointments, prescriptions, labReports, pharmacyOrders] = await Promise.all([
      appointmentModel.find({ userId }).sort({ date: -1 }),
      prescriptionModel.find({ userId }).sort({ createdAt: -1 }),
      labReportModel.find({ userId }).sort({ createdAt: -1 }),
      pharmacyOrderModel.find({ userId }).sort({ createdAt: -1 }),
    ])

    return res.json({
      success: true,
      timeline: {
        appointments,
        prescriptions,
        labReports,
        pharmacyOrders,
      },
    })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

const doctorViewAppointmentRecords = async (req, res) => {
  try {
  const docId = req.docId || req.body.docId
    const { appointmentId } = req.params

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(docId)) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    const [prescription, labReports] = await Promise.all([
      prescriptionModel.findOne({ appointmentId }),
      labReportModel.find({ appointmentId }).sort({ createdAt: -1 }),
    ])

    return res.json({
      success: true,
      appointment,
      prescription,
      labReports,
    })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

export {
  uploadLabReport,
  listPatientRecords,
  doctorViewAppointmentRecords,
}
