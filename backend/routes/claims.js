const express = require("express");
const mongoose = require("mongoose");
const Claim = require("../models/Claim");
const Policyholder = require("../models/Policyholder.js");
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

/**
 * @swagger
 * /claims:
 *   post:
 *     summary: Create a new claim
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               policyholderId:
 *                 type: string
 *               amount:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date
 *             example:
 *               policyholderId: "user@example.com"
 *               amount: 1000
 *               date: "2023-10-01"
 *     responses:
 *       201:
 *         description: Claim created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 *       400:
 *         description: Bad request (e.g., missing fields or invalid data)
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (invalid permissions)
 */

/**
 * @swagger
 * /claims/{id}:
 *   get:
 *     summary: Get a claim by ID
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The claim ID
 *     responses:
 *       200:
 *         description: Claim retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 *       404:
 *         description: Claim not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (invalid permissions)
 */

/**
 * @swagger
 * /claims/{id}/status:
 *   put:
 *     summary: Update claim status
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The claim ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pending, Approved, Rejected]
 *             example:
 *               status: "Approved"
 *     responses:
 *       200:
 *         description: Claim status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Claim'
 *       400:
 *         description: Bad request (e.g., invalid status)
 *       404:
 *         description: Claim not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (invalid permissions)
 */

/**
 * @swagger
 * /claims/{id}:
 *   delete:
 *     summary: Delete a claim
 *     tags: [Claims]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The claim ID
 *     responses:
 *       200:
 *         description: Claim deleted successfully
 *       404:
 *         description: Claim not found
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       403:
 *         description: Forbidden (invalid permissions)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Claim:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         policyholderId:
 *           type: string
 *         amount:
 *           type: number
 *         date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [Pending, Approved, Rejected]
 *       example:
 *         id: "64f1b2c3e4b0a1b2c3d4e5f6"
 *         policyholderId: "user@example.com"
 *         amount: 1000
 *         date: "2023-10-01"
 *         status: "Pending"
 */
// 1. Create a claim
router.post("/", async (req, res, next) => {
  console.log("Received POST request to /api/claims");

  const { amount, date, documentUrl, description,policyholderEmail,scannedData} = req.body;
  if (!amount || !date || !documentUrl || !description) {
    return res.status(400).json({ message: "All fields are required. for post /" });
  }

  try {
    

    // Fetch policyholder details
    const policyholder = await Policyholder.findOne({email:policyholderEmail});
    
    
    const policyId = policyholder.policyId;
    const policyholderId = policyholder._id;
    console.log("Policy ID found:", policyId);

    // Create claim in database
    const newClaim = await Claim.create({ 
      policyId,  
      policyholderId, 
      policyholderEmail, 
      amount, 
      date,
      documentUrl,
      description,
      scannedData
    });

    
    res.status(201).json(newClaim);
  } catch (error) {
    console.error("Error submitting claim:", error);
    next(error);  // Pass error to Express error handler
  }
});




// 5. Get all claims (Admin)
router.get("/", async (req, res, next) => {
  try {
    const claims = await Claim.find().populate("policyId", "name"); // Fetch all claims
    res.json(claims);
  } catch (error) {
    next(error);
  }
});

// 2. Get a claim by ID
router.get("/:id", async (req, res,next) => {
  try {
    const claim = await Claim.findById(req.params.id).populate('policyholderId');
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    res.json(claim);
  } catch (error) {
    next(error);
  }
});

// 3. Update claim status
router.put("/:id", async (req, res,next) => {
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
router.delete("/:id", async (req, res,next) => {
  try {
    const claim = await Claim.findByIdAndDelete(req.params.id);
    if (!claim) return res.status(404).json({ message: "Claim not found." });

    res.json({ message: "Claim deleted successfully." });
  } catch (error) {
    next(error);
  }
});

// Claims of a Specific User
router.post("/my-claims", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const claims = await Claim.find({ policyholderEmail: email }).populate("policyId");
    res.json(claims);
  } catch (error) {
    console.error("Error fetching claims:", error);
    res.status(500).json({ message: "Error fetching claims" });
  }
});


module.exports = router;
