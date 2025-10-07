import mongoose from "mongoose";
const { Schema, model } = mongoose;

const DoctorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    licenseNo: String,
    yearsExperience: Number,
    bio: String,
    avatarUrl: String,
    clinicDefaultId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    isVerified: { type: Boolean, default: false },
    specializationIds: [{ type: Schema.Types.ObjectId, ref: "Specialization" }],
  },
  { timestamps: true, collection: "doctors" }
);

export default model("Doctor", DoctorSchema);
