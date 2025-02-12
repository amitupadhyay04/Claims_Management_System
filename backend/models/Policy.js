const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  coverageAmount: { type: Number, required: true },
  premium: { type: Number, required: true },
  category: { type: String, enum: ["health", "life", "auto", "home"], required: true },
  createdAt: { type: Date, default: Date.now },
  enrolledUsers: [{ type: String, required: true }], // Store user emails
});

module.exports = mongoose.model("Policy", PolicySchema);
