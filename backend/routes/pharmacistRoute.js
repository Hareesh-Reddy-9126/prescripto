import express from 'express'
import upload from '../middleware/multer.js'
import authPharmacist from '../middleware/authPharmacist.js'
import { registerPharmacy, loginPharmacy, getPharmacyProfile, updatePharmacyProfile, pharmacistDashboard, listPharmacyOrders, orderDetail, updateOrderStatus, pharmacyTimeline } from '../controllers/pharmacistController.js'
import { pharmacistGetPrescription } from '../controllers/prescriptionController.js'

const pharmacistRouter = express.Router()

pharmacistRouter.post('/register', upload.array('documents', 5), registerPharmacy)
pharmacistRouter.post('/login', loginPharmacy)
pharmacistRouter.get('/profile', authPharmacist, getPharmacyProfile)
pharmacistRouter.post('/update-profile', authPharmacist, upload.array('documents', 5), updatePharmacyProfile)
pharmacistRouter.get('/dashboard', authPharmacist, pharmacistDashboard)
pharmacistRouter.post('/orders', authPharmacist, listPharmacyOrders)
pharmacistRouter.post('/orders/detail', authPharmacist, orderDetail)
pharmacistRouter.post('/orders/update-status', authPharmacist, updateOrderStatus)
pharmacistRouter.post('/orders/timeline', authPharmacist, pharmacyTimeline)
pharmacistRouter.post('/orders/prescription', authPharmacist, pharmacistGetPrescription)

export default pharmacistRouter
