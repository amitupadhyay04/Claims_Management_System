const express = require("express");
const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const Policyholder = require("../models/policyholder.js");
const Policy = require("../models/Policy");

const router = express.Router();

// Middleware for claim validation
const validateClaim = async (req, res, next) => {
  const { policyholderId, amount, date } = req.body;

  if (!policyholderId || !amount || !date) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Claim amount must be positive." });
  }

  if (new Date(date) > new Date()) {
    return res.status(400).json({ message: "Claim date cannot be in the future." });
  }

  // Find policyholder by email instead of ObjectId
  const policyholder = await Policyholder.findOne({ email: policyholderId });
  if (!policyholder) {
    return res.status(400).json({ message: "Policyholder not found." });
  }

  const policy = await Policy.findById(policyholder.policyId);
  if (!policy) {
    return res.status(400).json({ message: "Policy not found." });
  }

  if (amount > policy.coverageAmount) {
    return res.status(400).json({ message: "Claim amount exceeds policy coverage amount." });
  }

  const activeClaim = await Claim.findOne({ policyholderId: policyholder._id, status: "Pending" });
  if (activeClaim) {
    return res.status(400).json({ message: "Policyholder already has an active claim." });
  }

  req.policyholder = policyholder; // Pass policyholder object for further use
  next();
};

// 1. Create a claim
router.post("/", validateClaim, async (req, res) => {
  try {
    const { amount, date } = req.body;
    const policyholderId = req.policyholder._id; // Use ObjectId as policyholderId
    const policyholderEmail = req.policyholder.email; // Use email for easy queries

    const newClaim = await Claim.create({ 
      policyholderId, 
      policyholderEmail, 
      amount, 
      date 
    });
    res.status(201).json(newClaim);
  } catch (error) {
     next(error);
  }
});

// 2. Get a claim by ID
router.get("/:id", async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('policyholderId');
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    res.json(claim);
  } catch (error) {
    next(error);
  }
});

// 3. Update claim status
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const claim = await Claim.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    res.json(claim);
  } catch (error) {
    next(error);
  }
});

// 4. Delete a claim
router.delete("/:id", async (req, res) => {
  try {
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    res.json({ message: "Claim deleted successfully." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
