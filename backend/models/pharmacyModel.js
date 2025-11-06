import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String, default: "" },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: "India" },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { _id: false });

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ownerName: { type: String, required: true },
  phone: { type: String, required: true },
  alternatePhone: { type: String },
  address: { type: addressSchema, required: true },
  licenseNumber: { type: String, required: true, unique: true },
  licenseDocuments: { type: [String], default: [] },
  gstNumber: { type: String },
  deliveryOptions: {
    type: [String],
    enum: ["pickup", "local-delivery", "courier"],
    default: ["pickup"],
  },
  operatingHours: {
    type: Map,
    of: new mongoose.Schema({
      open: { type: String },
      close: { type: String },
      closed: { type: Boolean, default: false },
    }, { _id: false }),
    default: {},
  },
  serviceRadiusKm: { type: Number, default: 5 },
  isApproved: { type: Boolean, default: false },
  approvedAt: { type: Date },
  approvedBy: { type: String },
  isActive: { type: Boolean, default: true },
  moderationNotes: { type: String, default: "" },
  payoutDetails: {
    accountHolder: { type: String },
    accountNumber: { type: String },
    ifsc: { type: String },
    upi: { type: String },
  },
  lastLoginAt: { type: Date },
}, { timestamps: true });

const pharmacyModel = mongoose.models.pharmacy || mongoose.model("pharmacy", pharmacySchema);
export default pharmacyModel;
