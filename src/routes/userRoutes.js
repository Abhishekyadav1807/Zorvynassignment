const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const userController = require("../controllers/userController");

// all user management routes require auth + admin role
router.get("/", auth, roleCheck("admin"), userController.getAllUsers);
router.get("/:id", auth, roleCheck("admin"), userController.getUserById);
router.put("/:id/role", auth, roleCheck("admin"), userController.updateUserRole);
router.put("/:id/status", auth, roleCheck("admin"), userController.updateUserStatus);

module.exports = router;
