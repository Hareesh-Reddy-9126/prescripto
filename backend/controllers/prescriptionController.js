import prescriptionModel from "../models/prescriptionModel.js";
import appointmentModel from "../models/appointmentModel.js";
import pharmacyOrderModel from "../models/pharmacyOrderModel.js";
import doctorModel from "../models/doctorModel.js";
import { notifyPatient } from "../utils/notificationService.js";

const normalizeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
};

const createOrUpdatePrescription = async (req, res) => {
  try {
    const {
      docId,
      appointmentId,
      diagnosis,
      clinicalNotes,
      medications,
      investigations,
      followUpDate,
      lifestyleAdvice,
      attachments,
      preferredPharmacies,
    } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (appointment.docId !== docId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const doctor = await doctorModel.findById(docId);
    if (!doctor) {
      return res.json({ success: false, message: "Doctor not found" });
    }

    const payload = {
      appointmentId,
      userId: appointment.userId,
      docId,
      diagnosis,
      clinicalNotes,
      medications: normalizeArray(medications),
      investigations: normalizeArray(investigations),
      lifestyleAdvice,
      attachments: normalizeArray(attachments),
      preferredPharmacies: normalizeArray(preferredPharmacies),
      lastUpdatedBy: docId,
    };

    if (followUpDate) {
      payload.followUpDate = new Date(followUpDate);
    }

    let prescription = await prescriptionModel.findOne({ appointmentId });

    if (prescription) {
      Object.assign(prescription, payload);
      await prescription.save();
    } else {
      prescription = new prescriptionModel(payload);
      await prescription.save();
    }

    await appointmentModel.findByIdAndUpdate(appointmentId, { prescriptionId: prescription._id });

    await notifyPatient({
      userId: appointment.userId,
      title: "New prescription available",
      message: `Dr. ${doctor.name} has shared a new prescription.`,
      metadata: { appointmentId, prescriptionId: prescription._id },
    });

    res.json({ success: true, message: "Prescription saved", prescription });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getPrescriptionByAppointment = async (req, res) => {
  try {
    const { appointmentId, requesterRole, requesterId } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    if (requesterRole === "doctor" && appointment.docId !== requesterId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (requesterRole === "patient" && appointment.userId !== requesterId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    if (requesterRole === "pharmacist" && appointment.pharmacyOrderId) {
      const order = await pharmacyOrderModel.findById(appointment.pharmacyOrderId);
      if (!order || order.pharmacyId.toString() !== requesterId) {
        return res.json({ success: false, message: "Unauthorized" });
      }
    }

    const prescription = await prescriptionModel.findOne({ appointmentId });
    res.json({ success: true, prescription });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listUserPrescriptions = async (req, res) => {
  try {
    const { userId } = req.body;

    const prescriptions = await prescriptionModel
      .find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const doctorGetPrescription = async (req, res) => {
  req.body.requesterRole = "doctor";
  req.body.requesterId = req.body.docId;
  return getPrescriptionByAppointment(req, res);
};

const patientGetPrescription = async (req, res) => {
  req.body.requesterRole = "patient";
  req.body.requesterId = req.body.userId;
  return getPrescriptionByAppointment(req, res);
};

const pharmacistGetPrescription = async (req, res) => {
  req.body.requesterRole = "pharmacist";
  req.body.requesterId = req.body.pharmacyId;
  return getPrescriptionByAppointment(req, res);
};

export {
  createOrUpdatePrescription,
  getPrescriptionByAppointment,
  listUserPrescriptions,
  doctorGetPrescription,
  patientGetPrescription,
  pharmacistGetPrescription,
};
