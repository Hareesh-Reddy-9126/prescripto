import express from 'express';
import { loginAdmin, appointmentsAdmin, appointmentCancel, addDoctor, allDoctors, adminDashboard, listPharmacies, reviewPharmacy, togglePharmacyActive, adminPharmacyOrders, adminUpdateOrderStatus, getPlatformSettings, updatePlatformSettings } from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';
const adminRouter = express.Router();

adminRouter.post("/login", loginAdmin)
adminRouter.post("/add-doctor", authAdmin, upload.single('image'), addDoctor)
adminRouter.get("/appointments", authAdmin, appointmentsAdmin)
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancel)
adminRouter.get("/all-doctors", authAdmin, allDoctors)
adminRouter.post("/change-availability", authAdmin, changeAvailablity)
adminRouter.get("/dashboard", authAdmin, adminDashboard)
adminRouter.get("/pharmacies", authAdmin, listPharmacies)
adminRouter.post("/pharmacies/review", authAdmin, reviewPharmacy)
adminRouter.post("/pharmacies/toggle-active", authAdmin, togglePharmacyActive)
adminRouter.get("/pharmacy-orders", authAdmin, adminPharmacyOrders)
adminRouter.post("/pharmacy-orders/update-status", authAdmin, adminUpdateOrderStatus)
adminRouter.get("/settings", authAdmin, getPlatformSettings)
adminRouter.post("/settings", authAdmin, updatePlatformSettings)

export default adminRouter;