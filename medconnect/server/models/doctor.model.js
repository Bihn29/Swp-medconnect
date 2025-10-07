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
    fullName: { type: String, required: true, trim: true },
    licenseNo: String,
    yearsExperience: Number,
    bio: String,
    avatarUrl: String,
    clinicDefaultId: { type: Schema.Types.ObjectId, ref: "Clinic" },
    isVerified: { type: Boolean, default: false },
    specializationIds: [{ type: Schema.Types.ObjectId, ref: "Specialization" }],
    ratingCount: { type: Number, default: 0 },
    ratingAvg: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false, collection: "doctors" }
);

DoctorSchema.index({ isVerified: 1, specializationIds: 1 });
DoctorSchema.index({ fullName: "text", bio: "text" });

export default model("Doctor", DoctorSchema);
