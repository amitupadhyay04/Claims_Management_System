const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const multerS3 = require("multer-s3");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();
const modelApi = process.env.MODEL_API

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Configure Multer S3
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, `claims/${Date.now()}_${file.originalname}`);
    },
  }),
});

// File Upload API Route
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File upload failed" });
  }

  // Get the uploaded file URL
  const fileUrl = req.file.location;

  try {
    // Prepare data for the Flask ML API
    const formData = new FormData();
    formData.append("path", fileUrl);  // Passing the S3 file URL to Flask

    // Interact with the Flask API for scanning
    const response = await axios.post(`${modelApi}/scan`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const result = response.data; // Use `response.data` directly
    console.log("Flask API response:", result);

    // Validate API response structure
    if (!result || typeof result !== "object") {
      console.error("Invalid API response structure:", result);
      return res.status(500).json({ error: "Invalid API response" });
    }

    // Return scan results as a response
    res.status(200).json({
      message: "Scan successful",
      data: result, // Directly return the scan result
      fileUrl, // Include the file URL in the response
    });
  } catch (error) {
    console.error("Error interacting with ML API:", error);
    res.status(500).json({ error: "Failed to process the request." });
  }
});

module.exports = router;
