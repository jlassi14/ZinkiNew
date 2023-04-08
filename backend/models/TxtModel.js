/* eslint-disable prettier/prettier */
const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userid: { type: String, default: "" },
    text: [{ type: String, default: "" }],
    ssml: [{ type: String, default: "" }],  },
  {
    timestamps: true,
  }
);

const txt = mongoose.model("txt", schema);

module.exports = txt;