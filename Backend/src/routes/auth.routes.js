const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller.js");

// POST /api/auth/register -> Register a new user
router.post("/register", authController.userRegisterController);

// POST /api/auth/login -> Login a user
router.post("/login", authController.userLoginController);

module.exports = router;