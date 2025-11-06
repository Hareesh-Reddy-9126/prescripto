import mongoose from 'mongoose'

const settingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

const settingsModel = mongoose.models.settings || mongoose.model('settings', settingsSchema)
export default settingsModel
