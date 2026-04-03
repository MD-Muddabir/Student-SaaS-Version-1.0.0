const app = require("./app");
require("./utils/cron");
const { keepAlive } = require("./utils/keepAlive"); // ✅ Phase 1.5

const PORT = process.env.PORT || 8080; // ✅ correct
const HOST = "0.0.0.0"; // ✅ keep this fixed

app.listen(PORT, HOST, () => {
    console.log(`✅ Server running on http://${HOST}:${PORT}`);
    console.log(`📱 Mobile devices can reach backend at http://[IP_ADDRESS]:${PORT}/api`);
    keepAlive(); // ✅ Phase 1.5: Start keep-alive pings in production
});

// ✅ Optional: handle crashes (recommended)
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err.message);
    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.error("❌ Unhandled Rejection:", err.message);
    process.exit(1);
});

