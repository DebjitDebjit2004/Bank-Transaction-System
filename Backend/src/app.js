const express= require("express");
const cookieParser = require("cookie-parser");

const app = express();

const authRoutes = require("./routes/auth.routes.js");

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

module.exports = app;