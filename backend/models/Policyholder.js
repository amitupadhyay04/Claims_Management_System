const mongoose = require("mongoose");

const PolicyholderSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy" }
});

module.exports = mongoose.model("Policyholder", PolicyholderSchema);
