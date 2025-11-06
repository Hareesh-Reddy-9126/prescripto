import express from 'express'
import {
  completeConsultation,
  doctorEnsureConsultation,
  getConsultationDetails,
  startConsultation,
} from '../controllers/consultationController.js'
import authDoctor from '../middleware/authDoctor.js'
import authUser from '../middleware/authUser.js'

const consultationRouter = express.Router()

consultationRouter.post('/doctor/schedule', authDoctor, doctorEnsureConsultation)
consultationRouter.post('/doctor/start', authDoctor, startConsultation)
consultationRouter.post('/doctor/complete', authDoctor, completeConsultation)
consultationRouter.post('/doctor/details', authDoctor, getConsultationDetails)
consultationRouter.post('/patient/details', authUser, getConsultationDetails)

export default consultationRouter
