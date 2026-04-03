/**
 * Database Configuration
 * Sequelize instance for MySQL connection
 * Uses environment variables for flexibility across environments
 * ✅ Phase 1.1: Optimized Connection Pooling, SSL, Compression, Health Check
 */

const { Sequelize } = require("sequelize");
require("dotenv").config();

// Log which DB we are connecting to (helps debug Railway issues)
const dbHost = process.env.DB_HOST || "localhost";
const dbName = process.env.DB_NAME || "student_saas";
const dbUser = process.env.DB_USER || "root";
const dbPort = parseInt(process.env.DB_PORT || "3306", 10);

console.log(`🗄️  Connecting to DB: ${dbUser}@${dbHost}:${dbPort}/${dbName}`);

// Initialize Sequelize with environment variables
const sequelize = new Sequelize(
    dbName,
    dbUser,
    process.env.DB_PASSWORD,
    {
        host: dbHost,
        port: dbPort,
        dialect: "mysql",

        // ✅ Phase 1.1: Only log slow queries in development
        logging: process.env.NODE_ENV === "development"
            ? (sql, timing) => {
                if (timing && timing > 500) {
                    console.warn(`🐌 SLOW QUERY (${timing}ms):`, sql.substring(0, 200));
                }
            }
            : false,
        benchmark: process.env.NODE_ENV === "development", // Track query times in dev

        // ✅ Phase 1.1: CRITICAL - Optimized Connection Pooling
        pool: {
            max: 10,        // Maximum connections (optimized for Railway/Render limits)
            min: 2,         // Keep 2 always ready - eliminates connection delay
            acquire: 30000, // Max time to get connection (30s)
            idle: 10000,    // Close idle connections after 10s
        },

        // ✅ Phase 1.1: Connection Timeout + SSL + Compression
        dialectOptions: {
            connectTimeout: 60000,
            ssl: process.env.DB_SSL === "true"
                ? { rejectUnauthorized: true }
                : false,
            compress: true, // Enable MySQL protocol compression
        },

        define: {
            timestamps: true,    // Automatically add created_at and updated_at
            underscored: true,   // Use snake_case to match database columns
            paranoid: false,     // Disable paranoid (faster deletes)
        },
    }
);

// ✅ Phase 1.1: Connection health check on startup
sequelize.authenticate()
    .then(() => console.log("✅ DB Pool Ready (min:2 connections warm)"))
    .catch(err => console.error("❌ DB Pool Failed:", err.message));

module.exports = sequelize;
