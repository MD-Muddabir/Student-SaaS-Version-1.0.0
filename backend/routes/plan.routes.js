const express = require("express");
const router = express.Router();
const planController = require("../controllers/plan.controller");
const verifyToken = require("../middlewares/auth.middleware");
const allowRoles = require("../middlewares/role.middleware");
const { cacheMiddleware, invalidateCache } = require("../middlewares/cache.middleware"); // ✅ Phase 3.4

// ✅ Phase 3.4: Cache plans for 1 hour (plans rarely change)
router.get("/", cacheMiddleware(3600), planController.getAllPlans);

// Create, Update, Delete - Super Admin Only (invalidates plan cache)
router.post("/", verifyToken, allowRoles("super_admin"), invalidateCache("cache:/api/plans*"), planController.createPlan);
router.put("/:id", verifyToken, allowRoles("super_admin"), invalidateCache("cache:/api/plans*"), planController.updatePlan);
router.delete("/:id", verifyToken, allowRoles("super_admin"), invalidateCache("cache:/api/plans*"), planController.deletePlan);

module.exports = router;
