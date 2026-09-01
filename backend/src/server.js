const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const db = require("./config/database");
const accountRoutes = require("./routes/accountRoutes");
const app = express();
const transactionRoutes = require("./routes/transactionRoutes");

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "DevBank API is running",
        status: "success"
    });
});

app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            service: "DevBank Backend",
            database: "connected",
            status: "healthy"
        });
    } catch (error) {
        console.error("Database connection error:", error.message);

        res.status(500).json({
            service: "DevBank Backend",
            database: "disconnected",
            status: "unhealthy"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`DevBank API running on port ${PORT}`);
});
