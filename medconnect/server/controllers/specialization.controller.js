import Specialization from "../models/specialization.model.js";

export const getAllSpecializations = async (req, res) => {
  try {
    const list = await Specialization.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getAllSpecializations error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}