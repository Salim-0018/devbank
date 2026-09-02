const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const db = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const app = express();

// Trust the Nginx reverse proxy
app.set("trust proxy", 1);

const PORT = process.env.PORT || 5000;

const allowedOrigins = (
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// ==================== SECURITY ====================

app.disable("x-powered-by");

app.use(
    helmet()
);

app.use(
    cors({
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    })
);

// ==================== RATE LIMIT ====================

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", apiLimiter);

// ==================== BODY PARSER ====================

app.use(
    express.json({
        limit: "10kb"
    })
);

// ==================== ROUTES ====================

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

// ==================== ROOT ====================

app.get("/", (req, res) => {
    res.status(200).json({
        message: "DevBank API is running",
        status: "success",
        version: "1.0.0"
    });
});

// ==================== HEALTH CHECK ====================

app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.status(200).json({
            service: "DevBank Backend",
            database: "connected",
            status: "healthy"
        });

    } catch (error) {
        console.error(
            "Database health check error:",
            error.message
        );

        res.status(503).json({
            service: "DevBank Backend",
            database: "disconnected",
            status: "unhealthy"
        });
    }
});

// ==================== 404 HANDLER ====================

app.use((req, res) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// ==================== GLOBAL ERROR HANDLER ====================

app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);

    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({
        message: "Internal server error"
    });
});

// ==================== SERVER ====================

const server = app.listen(PORT, () => {
    console.log(
        `DevBank API running on port ${PORT}`
    );
});

// ==================== GRACEFUL SHUTDOWN ====================

const shutdown = async (signal) => {
    console.log(`${signal} received. Shutting down...`);

    server.close(async () => {
        try {
            await db.end();

            console.log(
                "Database pool closed."
            );

            process.exit(0);

        } catch (error) {
            console.error(
                "Shutdown error:",
                error.message
            );

            process.exit(1);
        }
    });
};

process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);

process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);
