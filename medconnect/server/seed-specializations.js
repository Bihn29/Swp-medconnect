import mongoose from "mongoose";
import Specialization from "./models/specialization.model.js";
import dotenv from "dotenv";

dotenv.config();

const specializations = [
  {
    code: "ORTHOPEDIC",
    name: "Cơ Xương Khớp",
    description: "Chuyên khoa điều trị các bệnh về cơ, xương và khớp",
    avatar: "/uploads/co-xuong-khop.png",
  },
  {
    code: "NEUROLOGY",
    name: "Thần kinh",
    description: "Chuyên khoa điều trị các bệnh về hệ thần kinh",
    avatar: "/uploads/cot-song.png",
  },
  {
    code: "DIGESTIVE",
    name: "Tiêu hóa",
    description: "Chuyên khoa điều trị các bệnh về đường tiêu hóa",
    avatar: null,
  },
  {
    code: "OTOLARYNGOLOGY",
    name: "Tai Mũi Họng",
    description: "Chuyên khoa điều trị các bệnh về tai, mũi, họng",
    avatar: null,
  },
  {
    code: "CARDIOLOGY",
    name: "Tim mạch",
    description: "Chuyên khoa điều trị các bệnh về tim và mạch máu",
    avatar: null,
  },
  {
    code: "DERMATOLOGY",
    name: "Da liễu",
    description: "Chuyên khoa điều trị các bệnh về da và tóc",
    avatar: null,
  },
  {
    code: "PEDIATRICS",
    name: "Nhi khoa",
    description: "Chuyên khoa điều trị bệnh cho trẻ em",
    avatar: null,
  },
  {
    code: "DENTISTRY",
    name: "Nha khoa",
    description: "Chuyên khoa điều trị các bệnh về răng và nướu",
    avatar: null,
  },
  {
    code: "OPHTHALMOLOGY",
    name: "Mắt",
    description: "Chuyên khoa điều trị các bệnh về mắt",
    avatar: "/uploads/mat.png",
  },
  {
    code: "RESPIRATORY",
    name: "Hô hấp",
    description: "Chuyên khoa điều trị các bệnh về phổi và đường hô hấp",
    avatar: "/uploads/ho-hap-phoi.png",
  },
  {
    code: "ULTRASOUND",
    name: "Siêu âm thai",
    description: "Chuyên khoa siêu âm và chẩn đoán hình ảnh",
    avatar: "/uploads/sieu-am-thai.png",
  },
];

async function seedSpecializations() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing specializations
    await Specialization.deleteMany({});
    console.log("🗑️ Cleared existing specializations");

    // Insert new specializations
    const inserted = await Specialization.insertMany(specializations);
    console.log(`✅ Inserted ${inserted.length} specializations`);

    // List inserted specializations
    inserted.forEach((spec) => {
      console.log(
        `- ${spec.name} (${spec.code}) - Avatar: ${spec.avatar || "None"}`
      );
    });
  } catch (error) {
    console.error("❌ Error seeding specializations:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedSpecializations();
