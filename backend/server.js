const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

(async () => {
  try {
    // Connect to database
    await connectDB();

    const app = express();

    // Body parser
    app.use(express.json());

    // Enable CORS
    app.use(cors());

    // Define Routes
    app.use("/api/v1/auth", require("./routes/auth"));
    app.use("/api/v1/products", require("./routes/products"));

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();

