import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Doctor from "../models/doctor.model.js";
import User from "../models/user.model.js";
import Specialization from "../models/specialization.model.js";
import Clinic from "../models/clinic.model.js";

const MONGODB_URI = process.env.MONGODB_URL || "mongodb://localhost:27017/MedConnect";

async function checkDoctorNgocAnh() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Get all doctors
    const allDoctors = await Doctor.find({}).lean();
    console.log(`\n📊 Total doctors in collection: ${allDoctors.length}`);

    // Find doctor Ngọc Anh
    const ngocAnh = allDoctors.find(doc => 
      doc.fullName && doc.fullName.toLowerCase().includes("ngọc anh")
    );

    if (ngocAnh) {
      console.log("\n✅ Found Ngọc Anh doctor:");
      console.log("   ID:", ngocAnh._id);
      console.log("   Full Name:", ngocAnh.fullName);
      console.log("   userId:", ngocAnh.userId);
      console.log("   isActive:", ngocAnh.isActive);
      console.log("   isVerified:", ngocAnh.isVerified);
      console.log("   specializationIds:", ngocAnh.specializationIds);
      console.log("   clinicDefaultId:", ngocAnh.clinicDefaultId);

      // Check if userId exists
      if (ngocAnh.userId) {
        const user = await User.findById(ngocAnh.userId).lean();
        if (user) {
          console.log("   ✅ User exists:", user.email, user.fullName);
        } else {
          console.log("   ❌ User does NOT exist!");
        }
      } else {
        console.log("   ❌ userId is null/undefined!");
      }

      // Try populate
      const populated = await Doctor.findById(ngocAnh._id)
        .populate("userId", "fullName email phone")
        .populate("specializationIds", "name code")
        .populate("clinicDefaultId", "name address phone")
        .lean();

      console.log("\n   After populate:");
      console.log("   userId populated:", populated.userId);
      console.log("   specializationIds populated:", populated.specializationIds);
      console.log("   clinicDefaultId populated:", populated.clinicDefaultId);
    } else {
      console.log("\n❌ Ngọc Anh doctor NOT found!");
      console.log("All doctor names:");
      allDoctors.forEach((doc, idx) => {
        console.log(`   ${idx + 1}. ${doc.fullName || 'No name'} (ID: ${doc._id})`);
      });
    }

    // Check all doctors with their status
    console.log("\n📋 All doctors status:");
    const doctorsWithStatus = await Promise.all(
      allDoctors.map(async (doc) => {
        let userExists = null;
        if (doc.userId) {
          const user = await User.findById(doc.userId).lean();
          userExists = !!user;
        }
        return {
          name: doc.fullName,
          id: doc._id,
          userId: doc.userId,
          userExists,
          isActive: doc.isActive,
          isVerified: doc.isVerified,
        };
      })
    );

    doctorsWithStatus.forEach((doc, idx) => {
      console.log(`   ${idx + 1}. ${doc.name}`);
      console.log(`      - ID: ${doc.id}`);
      console.log(`      - userId: ${doc.userId} ${doc.userExists === false ? '❌ USER MISSING!' : doc.userExists ? '✅' : '⚠️ null'}`);
      console.log(`      - isActive: ${doc.isActive}`);
      console.log(`      - isVerified: ${doc.isVerified}`);
    });

    // Test the getAllDoctors query
    console.log("\n🔍 Testing getAllDoctors query (no filters):");
    const testDoctors = await Doctor.find({})
      .populate("userId", "fullName email phone")
      .populate("specializationIds", "name code")
      .populate("clinicDefaultId", "name address phone")
      .sort({ ratingAvg: -1, ratingCount: -1 })
      .lean();

    console.log(`   Found ${testDoctors.length} doctors after populate`);
    
    const ngocAnhIndex = testDoctors.findIndex(doc => 
      doc.fullName && doc.fullName.toLowerCase().includes("ngọc anh")
    );
    
    if (ngocAnhIndex !== -1) {
      const ngocAnhInQuery = testDoctors[ngocAnhIndex];
      console.log(`   ✅ Ngọc Anh found in query result at position ${ngocAnhIndex + 1}`);
      console.log(`   - Rating: ${ngocAnhInQuery.ratingAvg}, Count: ${ngocAnhInQuery.ratingCount}`);
      
      // Test with limit=15 (simulate what user might be using)
      const limit15 = testDoctors.slice(0, 15);
      const ngocAnhInLimit15 = limit15.find(doc => 
        doc.fullName && doc.fullName.toLowerCase().includes("ngọc anh")
      );
      
      if (ngocAnhInLimit15) {
        console.log(`   ✅ Ngọc Anh is in first 15 results`);
      } else {
        console.log(`   ❌ Ngọc Anh is NOT in first 15 results (position ${ngocAnhIndex + 1})`);
        console.log(`   ⚠️  If limit=15, Ngọc Anh will be missing!`);
      }
      
      // Test with default limit=10
      const limit10 = testDoctors.slice(0, 10);
      const ngocAnhInLimit10 = limit10.find(doc => 
        doc.fullName && doc.fullName.toLowerCase().includes("ngọc anh")
      );
      
      if (ngocAnhInLimit10) {
        console.log(`   ✅ Ngọc Anh is in first 10 results`);
      } else {
        console.log(`   ❌ Ngọc Anh is NOT in first 10 results (position ${ngocAnhIndex + 1})`);
        console.log(`   ⚠️  If limit=10 (default), Ngọc Anh will be missing!`);
      }
    } else {
      console.log("   ❌ Ngọc Anh NOT found in query result!");
      console.log("   Doctor names in query result:");
      testDoctors.forEach((doc, idx) => {
        console.log(`      ${idx + 1}. ${doc.fullName || 'No name'} (rating: ${doc.ratingAvg}, count: ${doc.ratingCount})`);
      });
    }
    
    // Show all doctors sorted by rating
    console.log("\n📊 All doctors sorted by rating (showing first 20):");
    testDoctors.slice(0, 20).forEach((doc, idx) => {
      const isNgocAnh = doc.fullName && doc.fullName.toLowerCase().includes("ngọc anh");
      console.log(`   ${idx + 1}. ${doc.fullName} ${isNgocAnh ? '⭐ [NGỌC ANH]' : ''} - Rating: ${doc.ratingAvg}, Count: ${doc.ratingCount}`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkDoctorNgocAnh();

