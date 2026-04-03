/**
 * Cloudinary Configuration
 * Central cloud image storage — replaces local /uploads folder
 * All images are stored permanently on Cloudinary CDN
 *
 * IMPORTANT: Set these env vars in Render/Railway dashboard:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 */

const cloudinary = require("cloudinary").v2;

const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey     = process.env.CLOUDINARY_API_KEY;
const apiSecret  = process.env.CLOUDINARY_API_SECRET;

// Guard: check for placeholder / missing values so the server doesn't crash
const isConfigured =
    cloudName  && cloudName  !== "your_cloud_name"  &&
    apiKey     && apiKey     !== "your_api_key"     &&
    apiSecret  && apiSecret  !== "your_api_secret";

if (isConfigured) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key:    apiKey,
        api_secret: apiSecret,
    });

    // Non-blocking startup ping — logs status, never crashes the server
    cloudinary.api.ping()
        .then(() => console.log("✅ Cloudinary connected successfully"))
        .catch((err) => console.warn("⚠️  Cloudinary ping failed (check credentials):", err.message));
} else {
    console.warn(
        "⚠️  Cloudinary NOT configured — file uploads will fail.\n" +
        "   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your environment."
    );
}

module.exports = cloudinary;
