import notificationModel from "../models/notificationModel.js";

const buildNotification = async ({ recipientId, recipientRole, title, message, metadata = {} }) => {
  const notification = new notificationModel({
    recipientId,
    recipientRole,
    title,
    message,
    metadata,
  });

  await notification.save();

  // Placeholder: integrate email / push providers here in future.
  return notification;
};

export const notifyPatient = async ({ userId, title, message, metadata }) => {
  if (!userId) return null;
  return buildNotification({ recipientId: userId, recipientRole: "patient", title, message, metadata });
};

export const notifyPharmacist = async ({ pharmacyId, title, message, metadata }) => {
  if (!pharmacyId) return null;
  return buildNotification({ recipientId: pharmacyId, recipientRole: "pharmacist", title, message, metadata });
};

export const notifyAdmin = async ({ adminId, title, message, metadata }) => {
  if (!adminId) return null;
  return buildNotification({ recipientId: adminId, recipientRole: "admin", title, message, metadata });
};

export const notifyDoctor = async ({ doctorId, title, message, metadata }) => {
  if (!doctorId) return null;
  return buildNotification({ recipientId: doctorId, recipientRole: "doctor", title, message, metadata });
};
