/* =======================================================
 * COLLECTION: Specializations
 *  Chuyên khoa
 * ======================================================= */

import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SpecializationSchema = new Schema(
  {
    code: { type: String, unique: true, sparse: true },
    name: { type: String, required: true },
    description: String,
    avatar: {
      type: String,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || v === "" || typeof v === "string";
        },
        message: "Avatar must be a valid string path",
      },
    },
  },
  { timestamps: true, collection: "Specializations" }
);

export default model("Specialization", SpecializationSchema);

//Thanh co sua
