const express= require("express");

const app = express();

const authRoutes = require("./routes/auth.routes.js");

/**
 * Middleware to parse the request body
 */
app.use(express.json());

/**
 * Auth Routes are used to register a new user and login a user and 
 * logout a user
 */

app.use("/api/auth", authRoutes);

module.exports = app;