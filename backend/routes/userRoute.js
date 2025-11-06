import express from 'express';
import { loginUser, registerUser, getProfile, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay, paymentStripe, verifyStripe, listPharmacies, createPharmacyOrder, listUserPharmacyOrders, userOrderTimeline } from '../controllers/userController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/authUser.js';
import { patientGetPrescription, listUserPrescriptions } from '../controllers/prescriptionController.js';
const userRouter = express.Router();

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)

userRouter.get("/get-profile", authUser, getProfile)
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile)
userRouter.post("/book-appointment", authUser, bookAppointment)
userRouter.get("/appointments", authUser, listAppointment)
userRouter.post("/cancel-appointment", authUser, cancelAppointment)
userRouter.post("/payment-razorpay", authUser, paymentRazorpay)
userRouter.post("/verifyRazorpay", authUser, verifyRazorpay)
userRouter.post("/payment-stripe", authUser, paymentStripe)
userRouter.post("/verifyStripe", authUser, verifyStripe)
userRouter.get("/pharmacies", authUser, listPharmacies)
userRouter.post("/order-medicine", authUser, createPharmacyOrder)
userRouter.get("/pharmacy-orders", authUser, listUserPharmacyOrders)
userRouter.post("/pharmacy-orders/timeline", authUser, userOrderTimeline)
userRouter.get("/prescriptions", authUser, listUserPrescriptions)
userRouter.post("/prescription/detail", authUser, patientGetPrescription)

export default userRouter;