import mongoose from "mongoose";
import Doctor from "../models/doctor.model.js";
import { config } from "dotenv";

config();

const MONGODB_URI =
  process.env.MONGODB_URL ||
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect";

async function fixDoctorsActiveStatus() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all verified doctors that don't have isActive set
    const doctorsToFix = await Doctor.find({
      isVerified: true,
      $or: [
        { isActive: { $exists: false } },
        { isActive: null },
        { isActive: false },
      ],
    });

    console.log(
      `📊 Found ${doctorsToFix.length} verified doctors without isActive=true\n`
    );

    if (doctorsToFix.length === 0) {
      console.log("✅ All verified doctors already have isActive=true");
      await mongoose.disconnect();
      return;
    }

    console.log("🔧 Updating doctors...\n");

    let updatedCount = 0;
    for (const doctor of doctorsToFix) {
      console.log(
        `   ${updatedCount + 1}. ${doctor.fullName} (${doctor._id})`
      );
      console.log(`      Before: isVerified=${doctor.isVerified}, isActive=${doctor.isActive}`);
      
      doctor.isActive = true;
      await doctor.save();
      
      updatedCount++;
      console.log(`      After: isVerified=${doctor.isVerified}, isActive=${doctor.isActive}\n`);
    }

    console.log(`\n✅ Successfully updated ${updatedCount} doctors`);
    console.log(`\n📊 Verification:`);
    
    const verifiedAndActive = await Doctor.countDocuments({
      isVerified: true,
      isActive: true,
    });
    console.log(`   Verified and Active doctors: ${verifiedAndActive}`);

    await mongoose.disconnect();
    console.log("\n✅ Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixDoctorsActiveStatus();

