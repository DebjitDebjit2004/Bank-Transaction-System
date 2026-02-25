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

app.get("/", (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Banking Ledger Service</title>
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          }
          body {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0f172a, #1e293b);
            color: #e5e7eb;
          }
          .card {
            max-width: 720px;
            width: 100%;
            background: rgba(15, 23, 42, 0.96);
            border-radius: 16px;
            padding: 28px 32px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
            border: 1px solid rgba(148, 163, 184, 0.3);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 4px 10px;
            border-radius: 999px;
            background: rgba(34, 197, 94, 0.1);
            color: #4ade80;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            margin-bottom: 12px;
          }
          h1 {
            font-size: 26px;
            margin-bottom: 8px;
          }
          h2 {
            font-size: 16px;
            font-weight: 500;
            color: #9ca3af;
            margin-bottom: 20px;
          }
          p {
            font-size: 14px;
            line-height: 1.5;
            color: #d1d5db;
            margin-bottom: 12px;
          }
          .section-title {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #9ca3af;
            margin-top: 18px;
            margin-bottom: 8px;
          }
          .list {
            list-style: none;
            font-size: 14px;
            color: #e5e7eb;
          }
          .list li {
            margin-bottom: 6px;
          }
          .pill {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: rgba(15, 118, 110, 0.18);
            color: #67e8f9;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          code {
            background: rgba(15, 23, 42, 0.9);
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 12px;
            color: #e5e7eb;
          }
          .footer {
            margin-top: 18px;
            font-size: 12px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <main class="card">
          <div class="badge">
            ● Online
            <span>Ledger Service is running</span>
          </div>
          <h1>Banking Transaction System by Ledger Concept (Backend Only)</h1>
          <h2>There is intentionally <strong>no frontend UI</strong> for this project.</h2>

          <p>
            This service exposes a set of REST APIs for:
          </p>
          <ul class="list">
            <li>• User authentication (register / login / logout)</li>
            <li>• Account management (create account, list accounts, get balance)</li>
            <li>• Ledger‑based money transfers with idempotent transactions</li>
          </ul>

          <div class="section-title">How to use this backend</div>
          <p>
            All endpoints and their request/response formats are documented in
            <code>Backend/Readme.md</code>.
          </p>
          <p>
            You can test every API using tools like
            <span class="pill">Postman</span> or any similar REST client
            (Insomnia, Thunder Client, curl, etc.).
          </p>

          <div class="section-title">Base URL (example)</div>
          <p>
            <code>http://localhost:3000</code>
          </p>
          <ul class="list">
            <li>• Auth APIs: <code>/api/auth</code></li>
            <li>• Account APIs: <code>/api/account</code></li>
            <li>• Transaction APIs: <code>/api/transactions</code></li>
          </ul>

          <p class="footer">
            Tip: start the server, open Postman, read
            <code>Readme.md</code>, and hit the APIs directly from there.
          </p>
        </main>
      </body>
      </html>
    `);
});

module.exports = app;