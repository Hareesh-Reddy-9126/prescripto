import express from 'express'
import { doctorViewAppointmentRecords, listPatientRecords, uploadLabReport } from '../controllers/medicalRecordController.js'
import authDoctor from '../middleware/authDoctor.js'
import authUser from '../middleware/authUser.js'
import upload from '../middleware/multer.js'

const medicalRecordRouter = express.Router()

medicalRecordRouter.post('/doctor/lab-report', authDoctor, upload.single('report'), uploadLabReport)
medicalRecordRouter.get('/doctor/appointment/:appointmentId', authDoctor, doctorViewAppointmentRecords)
medicalRecordRouter.post('/patient/timeline', authUser, listPatientRecords)

export default medicalRecordRouter
