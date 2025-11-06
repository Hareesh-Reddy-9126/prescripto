import mongoose from "mongoose";

const medicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  strength: { type: String },
  dosage: { type: String },
  frequency: { type: String },
  duration: { type: String },
  remarks: { type: String },
}, { _id: false });

const attachmentSchema = new mongoose.Schema({
  label: { type: String },
  url: { type: String, required: true },
  fileType: { type: String },
}, { _id: false });

const prescriptionSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  docId: { type: mongoose.Schema.Types.ObjectId, ref: "doctor", required: true },
  diagnosis: { type: String },
  clinicalNotes: { type: String },
  medications: { type: [medicationSchema], default: [] },
  investigations: { type: [String], default: [] },
  followUpDate: { type: Date },
  lifestyleAdvice: { type: String },
  attachments: { type: [attachmentSchema], default: [] },
  preferredPharmacies: { type: [mongoose.Schema.Types.ObjectId], ref: "pharmacy", default: [] },
  issuedAt: { type: Date, default: Date.now },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "doctor" },
}, { timestamps: true });

const prescriptionModel = mongoose.models.prescription || mongoose.model("prescription", prescriptionSchema);
export default prescriptionModel;
