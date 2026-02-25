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

/**
 * @description Get all accounts
 * @route GET /api/account/get-all
 * @access Private
 */
router.get("/get-all", authMiddleware.isLoggedIn, accountController.getAllAccountsController);

/**
 * @description Get bank balance of an account
 * @route GET /api/account/get-bank-balance/:accountId
 * @access Private
 */
router.get("/get-bank-balance/:accountId", authMiddleware.isLoggedIn, accountController.getAccountBankBalanceController);

module.exports = router;