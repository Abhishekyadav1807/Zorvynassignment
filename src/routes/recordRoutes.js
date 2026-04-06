const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");
const recordController = require("../controllers/recordController");

// validation rules for creating records
const createValidation = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((val) => val >= 0)
    .withMessage("Amount cannot be negative"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("category").notEmpty().withMessage("Category is required"),
];

// viewing = analyst + admin, creating/updating/deleting = admin only
router.get("/", auth, roleCheck("analyst", "admin"), recordController.getRecords);
router.get("/:id", auth, roleCheck("analyst", "admin"), recordController.getRecordById);
router.post("/", auth, roleCheck("admin"), createValidation, validate, recordController.createRecord);
router.put("/:id", auth, roleCheck("admin"), recordController.updateRecord);
router.delete("/:id", auth, roleCheck("admin"), recordController.deleteRecord);

module.exports = router;
