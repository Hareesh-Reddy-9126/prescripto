import mongoose from 'mongoose'

const doctorRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  speciality: { type: String },
  message: { type: String },
  status: { type: String, enum: ['pending','reviewed','rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
})

const doctorRequestModel = mongoose.model('DoctorRequest', doctorRequestSchema)

export default doctorRequestModel
