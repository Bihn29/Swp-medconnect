import User from "../models/user.model.js";
import Patient from "../models/patient.model.js";
import { ok, fail } from "../utils/response.js";
import { ERROR_CODES } from "../constants/index.js";

/**
 * Get current patient profile with full information
 */
export async function getCurrentPatientProfile(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    // Find user by app_user_id
    const user = await User.findById(appUserId).lean();
    if (!user) {
      return fail(res, 404, ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    // Find patient profile
    const patient = await Patient.findOne({ userId: appUserId }).lean();

    // Combine user and patient data
    const profileData = {
      user: {
        _id: user._id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      profile: patient
        ? {
            _id: patient._id,
            fullName: patient.fullName,
            dob: patient.dob,
            gender: patient.gender,
            nationalId: patient.nationalId,
            phone: patient.phone,
            address: patient.address,
            wardCode: patient.wardCode,
            districtCode: patient.districtCode,
            provinceCode: patient.provinceCode,
            bloodType: patient.bloodType,
            allergyNotes: patient.allergyNotes,
            relationshipToOwner: patient.relationshipToOwner,
            createdAt: patient.createdAt,
            updatedAt: patient.updatedAt,
            isComplete: !!(
              patient.fullName &&
              patient.dob &&
              patient.gender &&
              patient.phone
            ),
          }
        : null,
    };

    return ok(res, profileData);
  } catch (error) {
    console.error("Error fetching patient profile:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}

/**
 * Update patient profile
 */
export async function updatePatientProfile(req, res) {
  try {
    const claims = req.user || {};
    const appUserId = claims.app_user_id;

    if (!appUserId) {
      return fail(
        res,
        401,
        ERROR_CODES.UNAUTHORIZED,
        "User ID not found in token"
      );
    }

    const updateData = req.body;

    // Update user basic info
    const userUpdate = {};
    if (updateData.fullName) userUpdate.fullName = updateData.fullName;
    if (updateData.phone) userUpdate.phone = updateData.phone;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(appUserId, userUpdate);
    }

    // Update or create patient profile
    const patientUpdate = {
      userId: appUserId,
      fullName: updateData.fullName,
      dob: updateData.dob,
      gender: updateData.gender,
      nationalId: updateData.nationalId,
      phone: updateData.phone,
      address: updateData.address,
      wardCode: updateData.wardCode,
      districtCode: updateData.districtCode,
      provinceCode: updateData.provinceCode,
      bloodType: updateData.bloodType,
      allergyNotes: updateData.allergyNotes,
    };

    const patient = await Patient.findOneAndUpdate(
      { userId: appUserId },
      patientUpdate,
      { upsert: true, new: true }
    );

    return ok(res, {
      message: "Profile updated successfully",
      profile: patient,
    });
  } catch (error) {
    console.error("Error updating patient profile:", error);
    return fail(res, 500, ERROR_CODES.SERVER_ERROR, "Internal server error");
  }
}
