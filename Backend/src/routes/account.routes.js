const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const accountController = require("../controllers/account.controller");
/**
 * @description Create a new account
 * @route POST /api/account/create-new
 * @access Private
 */
router.post("/create-new", authMiddleware.isLoggedIn, accountController.createAccountController);

module.exports = router;