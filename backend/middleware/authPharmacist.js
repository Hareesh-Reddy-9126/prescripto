import jwt from "jsonwebtoken";
import pharmacyModel from "../models/pharmacyModel.js";

const authPharmacist = async (req, res, next) => {
  try {
    const { token } = req.headers;

    if (!token) {
      return res.status(401).json({ success: false, message: "Not Authorized. Login Again." });
    }

    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (!tokenDecode?.id) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }

    const pharmacy = await pharmacyModel.findById(tokenDecode.id);

    if (!pharmacy) {
      return res.status(404).json({ success: false, message: "Pharmacy not found" });
    }

    if (!pharmacy.isApproved) {
      return res.status(403).json({ success: false, message: "Pharmacy pending approval" });
    }

    if (!pharmacy.isActive) {
      return res.status(403).json({ success: false, message: "Pharmacy account disabled" });
    }

  req.body = req.body || {};
  req.body.pharmacyId = pharmacy._id.toString();
    req.pharmacy = pharmacy;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ success: false, message: "Authentication failed" });
  }
};

export default authPharmacist;
