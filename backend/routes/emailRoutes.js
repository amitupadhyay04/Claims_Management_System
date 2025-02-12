const express = require("express");
const sendEmail = require("../controllers/emailService");

const router = express.Router();

router.post("/send-email", async (req, res) => {
  const { to, status } = req.body;

  if (!to || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const subject = `Your Claim Status: ${status}`;
  const message = `Dear User,\n\nYour claim has been ${status.toLowerCase()}. Please check your dashboard for more details.\n\nBest Regards,\nClaims Management Team`;

  const response = await sendEmail(to, subject, message);

  if (response.success) {
    res.json({ message: "Email sent successfully" });
  } else {
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
