/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userid: { type: String, default: "" },
    quota_number: { type: String, default: "" },
    quota_type: { type: String, default: "" },
    max_value: { type: Number }
  },
  {
    timestamps: true,
  }
);

const Quota = mongoose.model("Quota", schema);

module.exports = Quota;