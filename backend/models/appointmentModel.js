import mongoose from "mongoose"

const consultationSchema = new mongoose.Schema({
    roomCode: { type: String },
    status: {
        type: String,
        enum: ['not_scheduled', 'scheduled', 'ready', 'live', 'completed'],
        default: 'not_scheduled'
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    summary: { type: String },
    followUpDate: { type: Date },
    notesForPatient: { type: String },
    notesForInternal: { type: String }
}, { _id: false })

const appointmentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    docId: { type: String, required: true },
    slotDate: { type: String, required: true },
    slotTime: { type: String, required: true },
    userData: { type: Object, required: true },
    docData: { type: Object, required: true },
    amount: { type: Number, required: true },
    date: { type: Number, required: true },
    cancelled: { type: Boolean, default: false },
    payment: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "prescription", default: null },
    pharmacyOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacyOrder", default: null },
    consultation: { type: consultationSchema, default: () => ({}) }
})

const appointmentModel = mongoose.models.appointment || mongoose.model("appointment", appointmentSchema)
export default appointmentModel