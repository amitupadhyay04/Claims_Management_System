const mongoose = require("mongoose");


const claimSchema = new mongoose.Schema({
  policyholderId: { type: mongoose.Schema.Types.ObjectId, ref: "Policyholder", required: true },
  policyholderEmail: { type: String, required: true }, // Store email for easy queries
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" }
});


module.exports = mongoose.model("Claim", claimSchema);
