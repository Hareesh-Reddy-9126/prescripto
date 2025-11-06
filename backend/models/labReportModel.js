import mongoose from 'mongoose'

const labReportSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'appointment', required: true },
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fileUrl: { type: String },
  uploadedBy: { type: String, enum: ['doctor', 'admin'], default: 'doctor' },
  metadata: { type: Object },
}, { timestamps: true })

const labReportModel = mongoose.models.labReport || mongoose.model('labReport', labReportSchema)
export default labReportModel
