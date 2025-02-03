const mongoose = require("mongoose");

const PolicySchema = new mongoose.Schema({
  coverageAmount: { type: Number, required: true },
});

module.exports = mongoose.model("Policy", PolicySchema);
