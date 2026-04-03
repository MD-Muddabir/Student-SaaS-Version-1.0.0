/**
 * Class Routes
 * Defines API endpoints for class management
 * ✅ Phase 3.4: Redis caching on GET routes
 */

const express = require("express");
const router = express.Router();
const classController = require("../controllers/class.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const { checkClassLimit } = require("../middlewares/planLimits.middleware");
const checkSubscription = require("../middlewares/subscription.middleware");
const checkManagerPermission = require("../middlewares/checkManagerPermission");
const { cacheMiddleware, invalidateCache } = require("../middlewares/cache.middleware"); // ✅ Phase 3.4

// Create Class - Check Limits (invalidates class cache)
router.post("/", verifyToken, checkSubscription, allowRoles("admin", "manager"), checkManagerPermission("classes.create"), checkClassLimit, invalidateCache("cache:/api/classes*"), classController.createClass);

// ✅ Phase 3.4: Cache class list for 10 minutes (600s), single class 15 min
router.get("/", verifyToken, checkSubscription, allowRoles("admin", "faculty", "manager"), checkManagerPermission("classes.read", ["fees", "attendance", "reports", "transport"]), cacheMiddleware(600), classController.getAllClasses);
router.get("/:id", verifyToken, checkSubscription, allowRoles("admin", "faculty", "manager"), checkManagerPermission("classes.read", ["fees", "attendance", "reports"]), cacheMiddleware(900), classController.getClassById);
router.put("/:id", verifyToken, checkSubscription, allowRoles("admin", "manager"), checkManagerPermission("classes.update"), invalidateCache("cache:/api/classes*"), classController.updateClass);
router.delete("/:id", verifyToken, checkSubscription, allowRoles("admin", "manager"), checkManagerPermission("classes.delete"), invalidateCache("cache:/api/classes*"), classController.deleteClass);

module.exports = router;
