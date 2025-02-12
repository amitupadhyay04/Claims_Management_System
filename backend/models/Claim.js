const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true }, // Reference to Policy
  policyholderId: { type: mongoose.Schema.Types.ObjectId, ref: "Policyholder", required: true },
  policyholderEmail: { type: String, required: true }, // Store email for easy queries
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  description: { type: String, required: true }, // Claim description
  documentUrl: { type: String, required: true }, // Store uploaded file URL
  scannedData: { 
    type: Map,
    of: [String], // Each key in the Map is an array of strings (scanned data like CARDINAL, DATE, etc.)
    required: false // It's optional if you want to allow claims without scanned data
  }
});

module.exports = mongoose.model("Claim", claimSchema);
