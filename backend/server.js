require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const claimRoutes = require("./routes/claims");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// API Routes
app.use("/claims", claimRoutes);

app.get("/", (req, res) => {
  res.send("Claims Management API is running...");
});

app.use(errorHandler);
// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
