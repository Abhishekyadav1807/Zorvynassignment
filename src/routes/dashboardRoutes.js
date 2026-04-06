const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const dashboardController = require("../controllers/dashboardController");

// all dashboard routes are accessible by all authenticated roles
// viewers can see dashboard summaries, analysts and admins too
router.get("/summary", auth, roleCheck("viewer", "analyst", "admin"), dashboardController.getSummary);
router.get("/category-summary", auth, roleCheck("viewer", "analyst", "admin"), dashboardController.getCategorySummary);
router.get("/monthly-trends", auth, roleCheck("viewer", "analyst", "admin"), dashboardController.getMonthlyTrends);
router.get("/recent", auth, roleCheck("viewer", "analyst", "admin"), dashboardController.getRecentActivity);

module.exports = router;
