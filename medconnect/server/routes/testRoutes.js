import express from "express";
import DoctorTimeSlot from "../models/doctorTimeSlot.model.js";
import Doctor from "../models/doctor.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

const router = express.Router();

/**
 * Create test time slots for a doctor (for development/testing)
 */
router.post("/:doctorId/create-test-slots", async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return fail(res, 404, ERROR_CODES.NOT_FOUND, "Doctor not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const createdSlots = [];

    // Create time slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + dayOffset);

      // Create slots from 9:00 AM to 5:00 PM, 30 minutes each
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startAt = new Date(currentDate);
          startAt.setHours(hour, minute, 0, 0);

          const endAt = new Date(currentDate);
          endAt.setHours(hour, minute + 30, 0, 0);

          // Skip if slot already exists
          const existingSlot = await DoctorTimeSlot.findOne({
            doctorId: doctorId,
            startAt,
            endAt
          });

          if (!existingSlot) {
            const slot = await DoctorTimeSlot.create({
              doctorId: doctorId,
              startAt,
              endAt,
              status: "available"
            });
            createdSlots.push(slot);
          }
        }
      }
    }

    return ok(res, { 
      message: `Created ${createdSlots.length} time slots for doctor ${doctor.fullName}`,
      slots: createdSlots 
    });
  } catch (e) {
    console.error("❌ createTestTimeSlots error:", e);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, e.message || String(e));
  }
});

export default router;
