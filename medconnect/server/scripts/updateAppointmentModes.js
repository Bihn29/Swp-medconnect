import mongoose from "mongoose";
import Appointment from "../models/appointment.model.js";

// Connect to MongoDB Atlas
mongoose.connect(
  "mongodb+srv://ngothanhbinh29072000_db_user:rSKKRDJeTGb8ZmSb@cluster0.hgydltf.mongodb.net/MedConnect?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function updateAppointmentModes() {
  try {
    console.log(
      "🔍 Updating appointment modes from 'online' to 'offline'...\n"
    );

    // Find all online appointments
    const onlineAppointments = await Appointment.find({ mode: "online" });

    console.log(`📊 Found ${onlineAppointments.length} online appointments`);

    if (onlineAppointments.length === 0) {
      console.log("✅ No online appointments found to update");
      return;
    }

    // Update all online appointments to offline
    const result = await Appointment.updateMany(
      { mode: "online" },
      {
        $set: {
          mode: "offline",
          updatedAt: new Date(),
        },
      }
    );

    console.log(
      `\n✅ Updated ${result.modifiedCount} appointments from 'online' to 'offline'`
    );

    // Verify the update
    const updatedCount = await Appointment.countDocuments({ mode: "offline" });
    const remainingOnlineCount = await Appointment.countDocuments({
      mode: "online",
    });

    console.log(`📈 After update:`);
    console.log(`   Offline appointments: ${updatedCount}`);
    console.log(`   Online appointments: ${remainingOnlineCount}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
  }
}

updateAppointmentModes();
