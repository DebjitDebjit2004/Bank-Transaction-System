const express = require("express");
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
            background: #f3f4f6;
            color: #111827;
          }
          .card {
            max-width: 760px;
            width: 100%;
            background: #ffffff;
            border-radius: 14px;
            padding: 28px 32px 26px;
            box-shadow:
              0 16px 40px rgba(15, 23, 42, 0.06),
              0 0 0 1px rgba(148, 163, 184, 0.25);
            border-left: 4px solid #0ea5e9;
            opacity: 0;
            transform: translateY(8px);
            animation: fadeInUp 420ms ease-out forwards;
          }
          @keyframes fadeInUp {
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .top-line {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .status {
            font-size: 12px;
            padding: 3px 10px;
            border-radius: 999px;
            background: #e0f2fe;
            color: #0369a1;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .pulse {
            position: relative;
            width: 8px;
            height: 8px;
            border-radius: 999px;
            background: #22c55e;
            margin-right: 6px;
          }
          .pulse::after {
            content: "";
            position: absolute;
            inset: -4px;
            border-radius: inherit;
            border: 2px solid rgba(34, 197, 94, 0.5);
            opacity: 0;
            animation: pulse 1400ms ease-out infinite;
          }
          @keyframes pulse {
            0% { transform: scale(0.5); opacity: 0.9; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          h1 {
            font-size: 24px;
            margin-bottom: 4px;
          }
          h2 {
            font-size: 15px;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 18px;
          }
          p {
            font-size: 14px;
            line-height: 1.55;
            color: #374151;
            margin-bottom: 10px;
          }
          .section-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #6b7280;
            margin-top: 14px;
            margin-bottom: 4px;
          }
          .list {
            list-style: none;
            font-size: 14px;
            color: #111827;
            margin-bottom: 6px;
          }
          .list li {
            margin-bottom: 4px;
          }
          code {
            background: #eff6ff;
            padding: 2px 6px;
            border-radius: 5px;
            font-size: 12px;
            color: #0f172a;
          }
          .chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            background: #e0f2fe;
            color: #0369a1;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .footer {
            margin-top: 14px;
            font-size: 12px;
            color: #6b7280;
          }
          .subtle-bar {
            margin-top: 16px;
            height: 3px;
            border-radius: 999px;
            background: linear-gradient(90deg, #0ea5e9, #38bdf8);
            position: relative;
            overflow: hidden;
          }
          .subtle-bar::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, rgba(255,255,255,0.0), rgba(255,255,255,0.9), rgba(255,255,255,0.0));
            transform: translateX(-100%);
            animation: shimmer 2600ms ease-in-out infinite;
          }
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            40% { transform: translateX(100%); }
            100% { transform: translateX(100%); }
          }
        </style>
      </head>
      <body>
        <main class="card">
          <div class="top-line">
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="pulse"></div>
              <span class="status">Service running</span>
            </div>
            <span style="font-size:12px;color:#6b7280;">Backend only • No UI</span>
          </div>
  
          <h1>Banking Transaction System by Ledger Concept</h1>
          <h2>This project only provides the backend APIs – there is no separate frontend UI.</h2>
  
          <p>
            All <strong>API endpoints</strong> (auth, accounts, transactions, ledger flow) are documented in detail
            inside the <code>Backend/Readme.md</code> file.
          </p>
  
          <div class="section-title">How to test the APIs</div>
          <p>
            BASE URL for POSTMAN<span class="chip">https://bank-transaction-system.onrender.com</span> 
          </p>
          <p>
            You can test every endpoint using <span class="chip">Postman</span> or any REST client
            (Insomnia, Thunder Client, curl, etc.).
          </p>
  
          <ul class="list">
            <li>• Auth APIs: <code>/api/auth</code></li>
            <li>• Account APIs: <code>/api/account</code></li>
            <li>• Transaction APIs: <code>/api/transactions</code></li>
          </ul>
  
          <p class="footer">
            Start the server, open <code>Readme.md</code>, and follow the documented request/response formats
            to call the APIs from your REST client.
          </p>
  
          <div class="subtle-bar"></div>
        </main>
      </body>
      </html>
    `);
});

module.exports = app;