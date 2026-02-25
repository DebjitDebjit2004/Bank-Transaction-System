const express= require("express");
const cookieParser = require("cookie-parser");

const app = express();

const authRoutes = require("./routes/auth.routes.js");
const accountRoutes = require("./routes/account.routes.js")
const transactionRoutes = require("./routes/transaction.routes.js")

/**
 * Middleware to parse the request body
 */
app.use(express.json());

/**
 * Middleware to parse the cookies
 */
app.use(cookieParser());

/**
 * Auth Routes are used to register a new user and login a user and 
 * logout a user
 */
app.use("/api/auth", authRoutes);

/**
 * Account Routes are used to create a new account for a user
 */
app.use("/api/account", accountRoutes);

/**
 * Transaction Routes are used to create a new transaction and create initial funds transaction from system user
 */
app.use("/api/transactions", transactionRoutes);

module.exports = app;