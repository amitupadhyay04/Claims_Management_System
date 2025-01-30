const express = require("express");
const app = express();
app.use(express.json());

// In-memory data structures
let claims = [];
let policyholders = [
  { id: 1, name: "John Doe", policyId: 1 },
  { id: 2, name: "Amit Upadhyay", policyId: 2 }
];
let policies = [
  { id: 1, coverageAmount: 5000 },
  { id: 2, coverageAmount: 10000 }
];

let nextClaimId = 1;

// Middleware for claim validation
function validateClaim(req, res, next) {
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

  const policyholder = policyholders.find(ph => ph.id === policyholderId);
  if (!policyholder) {
    return res.status(400).json({ message: "Policyholder not found." });
  }

  const policy = policies.find(p => p.id === policyholder.policyId);
  if (!policy) {
    return res.status(400).json({ message: "Policy not found." });
  }

  if (amount > policy.coverageAmount) {
    return res.status(400).json({ message: "Claim amount exceeds policy coverage amount." });
  }

  const activeClaim = claims.find(c => c.policyholderId === policyholderId && c.status === "Pending");
  if (activeClaim) {
    return res.status(400).json({ message: "Policyholder already has an active claim." });
  }

  next();
}

// 1. Create a claim (with validation)
app.post("/claims", validateClaim, (req, res) => {
  const { policyholderId, amount, date } = req.body;
  const newClaim = { id: nextClaimId++, policyholderId, amount, date, status: "Pending" };
  claims.push(newClaim);
  res.status(201).json(newClaim);
});

// 2. Read (View) a claim
app.get("/claims/:id", (req, res) => {
  const claim = claims.find(c => c.id === parseInt(req.params.id));
  if (!claim) return res.status(404).json({ message: "Claim not found." });
  res.status(200).json(claim);
});

// 3. Update a claim's status
app.put("/claims/:id/status", (req, res) => {
  const claim = claims.find(c => c.id === parseInt(req.params.id));
  if (!claim) return res.status(404).json({ message: "Claim not found." });

  const { status } = req.body;
  const validStatuses = ["Pending", "Approved", "Rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status." });
  }

  claim.status = status;
  res.status(200).json(claim);
});

// 4. Delete a claim
app.delete("/claims/:id", (req, res) => {
  const claimIndex = claims.findIndex(c => c.id === parseInt(req.params.id));
  if (claimIndex === -1) return res.status(404).json({ message: "Claim not found." });

  claims.splice(claimIndex, 1);
  res.status(200).json({ message: "Claim deleted." });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
