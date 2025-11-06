import crypto from 'crypto'
import appointmentModel from '../models/appointmentModel.js'
import doctorModel from '../models/doctorModel.js'
import userModel from '../models/userModel.js'

const generateRoomCode = () => `prescripto-${crypto.randomBytes(6).toString('hex')}`

const sanitizeConsultation = (appointment) => {
  if (!appointment) {
    return null
  }
  const consultation = appointment.consultation || {}
  return {
    roomCode: consultation.roomCode,
    status: consultation.status || 'not_scheduled',
    startedAt: consultation.startedAt,
    endedAt: consultation.endedAt,
    summary: consultation.summary,
    followUpDate: consultation.followUpDate,
    notesForPatient: consultation.notesForPatient,
    notesForInternal: consultation.notesForInternal,
    appointmentId: appointment._id,
    slotDate: appointment.slotDate,
    slotTime: appointment.slotTime,
    doctorId: appointment.docId,
    patientId: appointment.userId,
  }
}

const doctorEnsureConsultation = async (req, res) => {
  try {
  const { appointmentId } = req.body
  const docId = req.docId || req.body.docId

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(docId)) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    if (!appointment.consultation?.roomCode) {
      appointment.consultation = {
        ...(appointment.consultation || {}),
        roomCode: generateRoomCode(),
        status: 'scheduled',
      }
    } else if (!appointment.consultation.status || appointment.consultation.status === 'not_scheduled') {
      appointment.consultation.status = 'scheduled'
    }

    await appointment.save()

    const doctor = await doctorModel.findById(appointment.docId).select('name speciality')
    const patient = await userModel.findById(appointment.userId).select('name')

    return res.json({
      success: true,
      consultation: {
        ...sanitizeConsultation(appointment),
        doctor,
        patient,
      },
    })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

const getConsultationDetails = async (req, res) => {
  try {
  const { appointmentId } = req.body
  const userId = req.userId || req.docId || req.body.userId || req.body.docId

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    const allowed = [String(appointment.userId), String(appointment.docId)]
    if (!allowed.includes(String(userId))) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    return res.json({ success: true, consultation: sanitizeConsultation(appointment) })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

const startConsultation = async (req, res) => {
  try {
  const { appointmentId } = req.body
  const docId = req.docId || req.body.docId

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(docId)) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    if (!appointment.consultation?.roomCode) {
      appointment.consultation = {
        ...(appointment.consultation || {}),
        roomCode: generateRoomCode(),
      }
    }

    appointment.consultation.status = 'live'
    appointment.consultation.startedAt = appointment.consultation.startedAt || new Date()

    await appointment.save()

    return res.json({ success: true, consultation: sanitizeConsultation(appointment) })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

const completeConsultation = async (req, res) => {
  try {
  const { appointmentId, summary, followUpDate, notesForPatient, notesForInternal } = req.body
  const docId = req.docId || req.body.docId

    const appointment = await appointmentModel.findById(appointmentId)
    if (!appointment) {
      return res.json({ success: false, message: 'Appointment not found' })
    }

    if (String(appointment.docId) !== String(docId)) {
      return res.json({ success: false, message: 'Unauthorized' })
    }

    appointment.consultation = {
      ...(appointment.consultation || {}),
      status: 'completed',
      endedAt: new Date(),
      summary,
      notesForPatient,
      notesForInternal,
    }

    if (followUpDate) {
      appointment.consultation.followUpDate = new Date(followUpDate)
    }

    appointment.isCompleted = true

    await appointment.save()

    return res.json({ success: true, consultation: sanitizeConsultation(appointment) })
  } catch (error) {
    console.log(error)
    return res.json({ success: false, message: error.message })
  }
}

export {
  doctorEnsureConsultation,
  getConsultationDetails,
  startConsultation,
  completeConsultation,
}
