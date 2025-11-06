import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pharmacyModel from "../models/pharmacyModel.js";
import pharmacyOrderModel from "../models/pharmacyOrderModel.js";
import { notifyPatient, notifyPharmacist } from "../utils/notificationService.js";

const sanitizePharmacy = (pharmacyDoc) => {
  if (!pharmacyDoc) return null;
  const pharmacy = pharmacyDoc.toObject();
  delete pharmacy.password;
  delete pharmacy.licenseDocuments;
  delete pharmacy.payoutDetails;
  return pharmacy;
};

const registerPharmacy = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      ownerName,
      phone,
      alternatePhone,
      address,
      licenseNumber,
      gstNumber,
      deliveryOptions,
      serviceRadiusKm,
    } = req.body;
    const files = req.files || [];

    if (!name || !email || !password || !ownerName || !phone || !address || !licenseNumber) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    const existing = await pharmacyModel.findOne({ email });
    if (existing) {
      return res.json({ success: false, message: "Pharmacy already registered" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const parsedAddress = typeof address === "string" ? JSON.parse(address) : address;

    const pharmacy = new pharmacyModel({
      name,
      email,
      password: hashedPassword,
      ownerName,
      phone,
      alternatePhone,
      address: parsedAddress,
      licenseNumber,
      gstNumber,
      deliveryOptions,
      serviceRadiusKm,
      isApproved: false,
    });

    if (files.length) {
      pharmacy.licenseDocuments = files.map((file) => file.path);
    }

    await pharmacy.save();
    res.json({ success: true, message: "Pharmacy submitted for approval" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const loginPharmacy = async (req, res) => {
  try {
    const { email, password } = req.body;

    const pharmacy = await pharmacyModel.findOne({ email });
    if (!pharmacy) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, pharmacy.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: pharmacy._id }, process.env.JWT_SECRET);

    res.json({
      success: true,
      token,
      requiresApproval: !pharmacy.isApproved,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getPharmacyProfile = async (req, res) => {
  try {
    const pharmacy = req.pharmacy || await pharmacyModel.findById(req.body.pharmacyId);
    res.json({ success: true, pharmacy: sanitizePharmacy(pharmacy) });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const updatePharmacyProfile = async (req, res) => {
  try {
    const { pharmacyId, name, ownerName, phone, alternatePhone, address, deliveryOptions, serviceRadiusKm, operatingHours } = req.body;
    const files = req.files || [];

    const updatePayload = {
      name,
      ownerName,
      phone,
      alternatePhone,
      deliveryOptions,
      serviceRadiusKm,
      operatingHours,
    };

    if (address) {
      updatePayload.address = typeof address === "string" ? JSON.parse(address) : address;
    }

    // remove undefined fields
    Object.keys(updatePayload).forEach((key) => {
      if (typeof updatePayload[key] === "undefined") {
        delete updatePayload[key];
      }
    });

    if (files.length) {
      updatePayload.licenseDocuments = files.map((file) => file.path);
    }

    const pharmacy = await pharmacyModel.findByIdAndUpdate(pharmacyId, updatePayload, { new: true });
    res.json({ success: true, message: "Profile updated", pharmacy: sanitizePharmacy(pharmacy) });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const pharmacistDashboard = async (req, res) => {
  try {
    const pharmacyId = req.body.pharmacyId || req.pharmacy?._id;

    const orders = await pharmacyOrderModel.find({ pharmacyId });

    const stats = {
      totalOrders: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inProgress: orders.filter((o) => ["accepted", "processing", "ready", "shipped"].includes(o.status)).length,
      completed: orders.filter((o) => o.status === "completed").length,
      revenue: orders.reduce((sum, order) => (order.status === "completed" ? sum + (order.totalAmount || 0) : sum), 0),
      latestOrders: orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const listPharmacyOrders = async (req, res) => {
  try {
    const { status, search } = req.body;
    const pharmacyId = req.body.pharmacyId || req.pharmacy?._id;

    const query = { pharmacyId };
    if (status) {
      query.status = status;
    }

    if (search) {
      query.orderNumber = { $regex: search, $options: "i" };
    }

    const orders = await pharmacyOrderModel.find(query).sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const orderDetail = async (req, res) => {
  try {
    const { orderId } = req.body;
    const pharmacyId = req.body.pharmacyId || req.pharmacy?._id;

    const order = await pharmacyOrderModel
      .findOne({ _id: orderId, pharmacyId })
      .populate("prescriptionId")
      .populate("userId", "name email phone address");

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const ALLOWED_STATUS_TRANSITIONS = {
  pending: ["accepted", "rejected"],
  accepted: ["processing", "rejected"],
  processing: ["ready", "shipped"],
  ready: ["completed", "shipped"],
  shipped: ["completed"],
};

const statusToNotification = {
  accepted: {
    title: "Order accepted",
    message: "Your pharmacy order has been accepted and will be prepared shortly.",
  },
  processing: {
    title: "Order is being prepared",
    message: "Your medicines are currently being prepared.",
  },
  ready: {
    title: "Order ready for pickup",
    message: "Your order is ready for pickup at the pharmacy.",
  },
  shipped: {
    title: "Order on the way",
    message: "Your order has been shipped.",
  },
  completed: {
    title: "Order delivered",
    message: "Your order has been completed.",
  },
  rejected: {
    title: "Order could not be fulfilled",
    message: "The pharmacy could not fulfill your order. Please contact support.",
  },
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, note, logistics } = req.body;
    const pharmacyId = req.body.pharmacyId || req.pharmacy?._id;

    const order = await pharmacyOrderModel.findOne({ _id: orderId, pharmacyId });

    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.status === status) {
      if (note) {
        order.notesForPatient = note;
        order.statusHistory.push({
          status,
          note,
          updatedBy: "pharmacist",
          updatedById: pharmacyId,
          timestamp: new Date(),
        });

        await order.save();

        if (statusToNotification[status]) {
          await notifyPatient({
            userId: order.userId,
            title: statusToNotification[status].title,
            message: `${statusToNotification[status].message} ${note}`.trim(),
            metadata: { orderId: order._id, status },
          });
        }

        return res.json({ success: true, message: "Patient note shared", order });
      }

      return res.json({ success: true, message: "Status already updated", order });
    }

    const allowedTransitions = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.json({ success: false, message: `Cannot move order from ${order.status} to ${status}` });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      note,
      updatedBy: "pharmacist",
      updatedById: pharmacyId,
      timestamp: new Date(),
    });

    if (note) {
      order.notesForPatient = note;
    }

    if (logistics) {
      const currentLogistics = order.logistics && typeof order.logistics.toObject === "function"
        ? order.logistics.toObject()
        : { ...order.logistics };

      order.logistics = { ...currentLogistics, ...logistics };
    }

    if (status === "completed") {
      order.logistics = {
        ...order.logistics,
        deliveredAt: new Date(),
      };
    }

    await order.save();

    if (statusToNotification[status]) {
      await notifyPatient({
        userId: order.userId,
        title: statusToNotification[status].title,
        message: note
          ? `${statusToNotification[status].message} ${note}`.trim()
          : statusToNotification[status].message,
        metadata: { orderId: order._id, status },
      });
    }

    res.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const pharmacyTimeline = async (req, res) => {
  try {
    const { orderId } = req.body;
    const pharmacyId = req.body.pharmacyId || req.pharmacy?._id;
    const order = await pharmacyOrderModel.findOne({ _id: orderId, pharmacyId }, { statusHistory: 1, status: 1 });
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, timeline: order.statusHistory, status: order.status });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  registerPharmacy,
  loginPharmacy,
  getPharmacyProfile,
  updatePharmacyProfile,
  pharmacistDashboard,
  listPharmacyOrders,
  orderDetail,
  updateOrderStatus,
  pharmacyTimeline,
};
