const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();

// Enable CORS
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow all origins
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200); // Handle preflight requests
    }
    next();
});

// Proxy configuration
app.use(
    "/api",
    createProxyMiddleware({
        target: process.env.TARGET_URL, // Target API URL from .env
        changeOrigin: true,
        pathRewrite: {
            "^/api": "", // Remove /api prefix when forwarding to the target
        },
    })
);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Proxy server is running on http://localhost:${PORT}`);
});
