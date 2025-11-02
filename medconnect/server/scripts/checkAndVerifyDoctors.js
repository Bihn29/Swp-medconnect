import mongoose from "mongoose";
import User from "../models/user.model.js";
import Doctor from "../models/doctor.model.js";
import { config } from "dotenv";

config();

const MONGODB_URI =
  process.env.MONGODB_URL ||
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect";

async function checkAndVerifyDoctors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    console.log("--- Checking Doctors Status ---\n");

    // 1. Count all doctors
    const totalDoctors = await Doctor.countDocuments({});
    console.log(`📊 Total doctors in Doctor collection: ${totalDoctors}`);

    // 2. Count by status
    const verifiedCount = await Doctor.countDocuments({ isVerified: true });
    const activeCount = await Doctor.countDocuments({ isActive: true });
    const verifiedAndActiveCount = await Doctor.countDocuments({
      isVerified: true,
      isActive: true,
    });

    console.log(`   ✅ Verified doctors: ${verifiedCount}`);
    console.log(`   ✅ Active doctors: ${activeCount}`);
    console.log(`   ✅ Verified AND Active: ${verifiedAndActiveCount}`);
    console.log(`   ❌ Unverified: ${totalDoctors - verifiedCount}`);
    console.log(`   ❌ Inactive: ${totalDoctors - activeCount}\n`);

    // 3. Check Users with role doctor
    const doctorUsers = await User.find({ role: "doctor" }).lean();
    console.log(`📊 Total users with role 'doctor': ${doctorUsers.length}\n`);

    // 4. Find doctors whose User is active but Doctor is not verified/active
    console.log("--- Checking doctors that should be verified/active ---\n");
    const doctorsToVerify = [];

    for (const user of doctorUsers) {
      const doctor = await Doctor.findOne({ userId: user._id }).lean();

      if (!doctor) {
        console.log(`   ❌ User ${user.fullName} (${user.email}) has no Doctor record`);
        continue;
      }

      const shouldBeActive = user.status === "active";
      const shouldBeVerified =
        user.emailVerified === true && user.phoneVerified === true;

      if (shouldBeActive && shouldBeVerified) {
        if (!doctor.isVerified || !doctor.isActive) {
          doctorsToVerify.push({
            doctorId: doctor._id,
            userId: user._id,
            doctorName: doctor.fullName,
            userEmail: user.email,
            currentIsVerified: doctor.isVerified,
            currentIsActive: doctor.isActive,
            userStatus: user.status,
            userEmailVerified: user.emailVerified,
            userPhoneVerified: user.phoneVerified,
          });
        }
      }
    }

    if (doctorsToVerify.length > 0) {
      console.log(
        `⚠️ Found ${doctorsToVerify.length} doctors that should be verified and active:\n`
      );
      doctorsToVerify.forEach((d, index) => {
        console.log(`   ${index + 1}. ${d.doctorName} (${d.userEmail})`);
        console.log(`      Doctor ID: ${d.doctorId}`);
        console.log(`      Current: isVerified=${d.currentIsVerified}, isActive=${d.currentIsActive}`);
        console.log(`      User: status=${d.userStatus}, emailVerified=${d.userEmailVerified}, phoneVerified=${d.userPhoneVerified}`);
        console.log();
      });

      console.log("\n--- Action Required ---\n");
      console.log("These doctors have active Users with verified email/phone,");
      console.log("but their Doctor records are not verified/active.");
      console.log("They need to be approved via the admin verification page.\n");
    } else {
      console.log(
        "✅ All doctors with active/verified users are already verified and active.\n"
      );
    }

    // 5. List all doctors with their status
    console.log("\n--- All Doctors in Database ---\n");
    const allDoctors = await Doctor.find({})
      .populate("userId", "fullName email status emailVerified phoneVerified")
      .select("_id fullName isVerified isActive userId")
      .lean();

    allDoctors.forEach((doctor, index) => {
      console.log(
        `${index + 1}. ${doctor.fullName || "No name"} (ID: ${doctor._id})`
      );
      console.log(`   isVerified: ${doctor.isVerified}, isActive: ${doctor.isActive}`);
      if (doctor.userId) {
        console.log(`   User: ${doctor.userId.email}`);
        console.log(
          `   User status: ${doctor.userId.status}, emailVerified: ${doctor.userId.emailVerified}, phoneVerified: ${doctor.userId.phoneVerified}`
        );
      } else {
        console.log(`   ⚠️ No linked User`);
      }
      console.log();
    });

    // 6. Summary
    console.log("\n--- Summary ---");
    console.log(`Total doctors: ${totalDoctors}`);
    console.log(`Verified and active: ${verifiedAndActiveCount}`);
    console.log(
      `Doctors that need verification: ${doctorsToVerify.length}`
    );
    console.log(
      `\n💡 To fix: Go to admin page and approve these doctors, OR`
    );
    console.log(
      `   run a script to automatically verify doctors with active users.`
    );

  } catch (error) {
    console.error("❌ Error during script execution:", error);
  } finally {
    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  }
}

checkAndVerifyDoctors();

