const { Router } = require('express');
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares.js")
const transactionController = require("../controllers/transaction.controller.js")

/**
 * - POST /api/transactions/new-transaction
 * - Create a new transaction
 */
router.post("/new-transaction", authMiddleware.isLoggedIn, transactionController.crateTransaction)

/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user
 */
router.post("/system/initial-funds", authMiddleware.isSystemUser, transactionController.createInitialFundsTransaction);

module.exports = router;