import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: [
      "pending",
      "accepted",
      "processing",
      "ready",
      "shipped",
      "completed",
      "rejected",
      "cancelled",
    ],
    required: true,
  },
  note: { type: String },
  updatedBy: { type: String },
  updatedById: { type: mongoose.Schema.Types.ObjectId },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const logisticsSchema = new mongoose.Schema({
  method: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
  courierName: { type: String },
  trackingNumber: { type: String },
  expectedDelivery: { type: Date },
  deliveredAt: { type: Date },
}, { _id: false });

const patientSnapshotSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
    state: { type: String },
    postalCode: { type: String },
    country: { type: String },
  },
}, { _id: false });

const pharmacyOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true },
  prescriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "prescription", required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "appointment", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "pharmacy", required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "processing", "ready", "shipped", "completed", "rejected", "cancelled"],
    default: "pending",
  },
  statusHistory: { type: [statusHistorySchema], default: [] },
  logistics: { type: logisticsSchema, default: () => ({}) },
  notesForPatient: { type: String },
  notesForInternal: { type: String },
  prescriptionSnapshot: { type: Object },
  patientSnapshot: { type: patientSnapshotSchema },
  totalAmount: { type: Number },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded"], default: "pending" },
  createdVia: { type: String, enum: ["patient", "admin"], default: "patient" },
}, { timestamps: true });

pharmacyOrderSchema.index({ orderNumber: 1 }, { unique: true });
pharmacyOrderSchema.index({ pharmacyId: 1, createdAt: -1 });
pharmacyOrderSchema.index({ userId: 1, createdAt: -1 });

const pharmacyOrderModel = mongoose.models.pharmacyOrder || mongoose.model("pharmacyOrder", pharmacyOrderSchema);
export default pharmacyOrderModel;
