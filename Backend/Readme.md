## Banking System Backend

Node.js + Express + MongoDB backend for a simple banking system.  
It supports **user authentication**, **account management**, and **money transfers with a ledger-based balance derivation and idempotent transactions**.

### Ledger system overview

- **What is stored**: instead of storing a mutable `balance` field on the account, the system stores **immutable ledger entries** (DEBIT / CREDIT) in a separate ledger collection.
- **How balance is calculated**: the current balance is **derived on demand** by summing all CREDIT entries and subtracting all DEBIT entries for a given account (`account.getBalance()`).
- **Why this is safer**:
  - Makes it easier to recover from errors or race conditions because every movement of money is recorded as an append-only event.
  - Auditing is straightforward: you can reconstruct how a balance was reached at any point in time.
  - Works well with MongoDB transactions in `transaction.controller.js` to ensure that the transaction and its ledger entries are written atomically.

#### Real-life style examples

- **Example 1 – Salary deposit**
  - Company sends you ₹50,000 as salary.
  - System creates a **CREDIT** ledger entry of `+50000` for your account.
  - Your balance becomes the previous balance plus `50000`.

- **Example 2 – ATM withdrawal**
  - You withdraw ₹2,000 from an ATM.
  - System creates a **DEBIT** ledger entry of `-2000` for your account.
  - Your new balance = old balance − `2000`, but the historical CREDIT for salary is still visible in the ledger.

- **Example 3 – Transfer between two users**
  - User A sends ₹1,000 to User B.
  - System creates:
    - A **DEBIT** ledger entry of `-1000` on User A’s account.
    - A **CREDIT** ledger entry of `+1000` on User B’s account.
  - Balances for both users are computed from all their respective ledger entries, so the transfer is fully traceable from both sides.

### Tech stack

- **Runtime**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Auth**: JWT (token in cookie or `Authorization: Bearer <token>`)

### Application entry points

- `server.js`: starts the HTTP server and connects to the database.
- `src/app.js`: configures Express, parses JSON & cookies, and mounts feature routes:
  - `/api/auth` → authentication routes
  - `/api/account` → bank account routes
  - `/api/transactions` → money transfer routes

---

## Authentication APIs (`/api/auth`)

All responses are JSON.

### POST `/api/auth/register`

**Description**: Register a new user.

- **Request body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPass@123",
  "systemUser": false
}
```

- **Successful response – 201**

```json
{
  "user": {
    "id": "ObjectId",
    "email": "john@example.com",
    "name": "John Doe",
    "systemUser": false
  },
  "message": "User registered successfully",
  "status": "Registered Successfully",
  "success": true,
  "token": "JWT_TOKEN"
}
```

### POST `/api/auth/login`

**Description**: Log in an existing user.  
Sets a `token` cookie and also returns the JWT in the response body.

- **Request body**

```json
{
  "email": "john@example.com",
  "password": "StrongPass@123"
}
```

- **Successful response – 200**

```json
{
  "user": {
    "id": "ObjectId",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "message": "User logged in successfully",
  "status": "Logged in Successfully",
  "success": true,
  "token": "JWT_TOKEN"
}
```

### POST `/api/auth/logout`

**Description**: Log out the current user.  
Adds the current token to the blacklist and clears the `token` cookie.

- **Request**: no body. Requires a valid JWT in cookie or `Authorization` header (if there is no token, it still returns a successful logout).

- **Successful response – 200**

```json
{
  "message": "User logged out successfully",
  "status": "Logged out Successfully",
  "success": true,
  "token": null,
  "user": null
}
```

---

## Account APIs (`/api/account`)

All routes here require authentication via **`isLoggedIn` middleware**.

### POST `/api/account/create-new`

**Description**: Create a new bank account for the logged-in user.

- **Headers**
  - `Authorization: Bearer <JWT>` or cookie `token=<JWT>`

- **Request body**: none

- **Successful response – 201**

```json
{
  "message": "Account created successfully",
  "success": true,
  "data": {
    "_id": "ObjectId",
    "user": "UserObjectId",
    "...": "other account fields"
  }
}
```

### GET `/api/account/get-all`

**Description**: Get all accounts for the logged-in user.

- **Headers**
  - `Authorization: Bearer <JWT>` or cookie `token=<JWT>`

- **Successful response – 200**

```json
{
  "message": "Accounts fetched successfully",
  "success": true,
  "data": [
    {
      "_id": "ObjectId",
      "user": "UserObjectId"
    }
  ],
  "status": "Success",
  "error": null
}
```

### GET `/api/account/get-bank-balance/:accountId`

**Description**: Get the **derived bank balance** of a specific account that belongs to the logged-in user.  
The balance is calculated via the account’s ledger entries (`account.getBalance()`).

- **Headers**
  - `Authorization: Bearer <JWT>` or cookie `token=<JWT>`

- **Route params**
  - `accountId`: MongoDB ObjectId of the account

- **Successful response – 200**

```json
{
  "message": "Account bank balance fetched successfully",
  "success": true,
  "data": 1000,
  "status": "Success",
  "error": null
}
```

- **Error – 404 (account not found)**

```json
{
  "message": "Account not found",
  "success": false,
  "data": null,
  "status": "Not Found",
  "error": "Account not found"
}
```

---

## Transaction APIs (`/api/transactions`)

Transactions use a ledger + idempotency key approach to guarantee **exactly-once** processing.

### POST `/api/transactions/new-transaction`

**Middleware chain**: `isLoggedIn` → `crateTransaction`

**Description**: Create a new money transfer from one account to another.

- **Headers**
  - `Authorization: Bearer <JWT>` or cookie `token=<JWT>`

- **Request body**

```json
{
  "fromAccount": "ObjectId of sender account",
  "toAccount": "ObjectId of receiver account",
  "amount": 100,
  "idempotencyKey": "unique-string-per-client-request"
}
```

- **Successful response – 201**

```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "_id": "ObjectId",
    "fromAccount": "ObjectId",
    "toAccount": "ObjectId",
    "amount": 100,
    "status": "COMPLETED",
    "idempotencyKey": "unique-string"
  },
  "ledgerEntries": [
    { "...": "DEBIT entry" },
    { "...": "CREDIT entry" }
  ],
  "success": true,
  "status": "Success",
  "error": null
}
```

- **Idempotency responses**
  - If the same `idempotencyKey` was already processed with status **SUCCESS** → **201**:

    ```json
    {
      "message": "Transaction already processed",
      "transaction": { "...": "existing transaction" }
    }
    ```

  - If existing transaction is still **PENDING** → **102**:

    ```json
    {
      "message": "Transaction is still processing"
    }
    ```

  - If existing transaction is **FAILED** → **500**:

    ```json
    {
      "message": "Transaction processing failed, please retry"
    }
    ```

  - If existing transaction is **REVERSED** → **500**:

    ```json
    {
      "message": "Transaction was reversed, please retry"
    }
    ```

- **Validation / business errors – 400**
  - Missing fields (`fromAccount`, `toAccount`, `amount`, `idempotencyKey`)
  - From/to account not found
  - Account not active
  - Insufficient balance (balance derived from ledger)

### POST `/api/transactions/system/initial-funds`

**Middleware chain**: `isSystemUser` → `createInitialFundsTransaction`

**Description**: System user credits initial funds into a target account.  
Only a user with `systemUser: true` can access this.

- **Headers**
  - `Authorization: Bearer <JWT of system user>` or cookie `token=<JWT>`

- **Request body**

```json
{
  "toAccount": "ObjectId of receiver account",
  "amount": 1000,
  "idempotencyKey": "unique-string-per-client-request"
}
```

- **Successful response – 201**

```json
{
  "message": "Initial funds transaction completed successfully",
  "transaction": {
    "_id": "ObjectId",
    "fromAccount": "SystemUserAccountId",
    "toAccount": "ObjectId",
    "amount": 1000,
    "status": "COMPLETED",
    "idempotencyKey": "unique-string"
  }
}
```

- **Validation errors – 400**
  - Missing `toAccount`, `amount`, or `idempotencyKey`
  - Invalid `toAccount`
  - System user account not found

---

## Controllers – Responsibilities

### `auth.controller.js`

- **`userRegisterController`**
  - Validates `name`, `email`, and `password` using `auth.validations.js`.
  - Ensures email uniqueness and creates a new user document.
  - Returns a JWT token and basic user info.

- **`userLoginController`**
  - Validates login credentials and checks email/password combination.
  - On success, issues a JWT, stores it in a cookie, and returns user data.

- **`userLogoutController`**
  - Reads JWT from cookie / `Authorization` header.
  - Blacklists the token and clears the cookie, effectively logging the user out.

### `account.controller.js`

- **`createAccountController`**
  - Uses `req.user` (injected by `isLoggedIn`) to create a new account for that user.

- **`getAllAccountsController`**
  - Fetches all accounts for the logged-in user.

- **`getAccountBankBalanceController`**
  - Ensures the requested account belongs to the current user.
  - Calls `account.getBalance()` to compute and return the derived balance.

### `transaction.controller.js`

- **`crateTransaction`** (money transfer between user accounts)
  - Validates required fields and idempotency key.
  - Confirms both accounts exist and are **ACTIVE**.
  - Computes sender balance using the ledger (`getBalance()`).
  - Starts a MongoDB transaction:
    - Creates a `Transaction` with status `PENDING`.
    - Inserts a DEBIT ledger entry for `fromAccount`.
    - Inserts a CREDIT ledger entry for `toAccount`.
    - Marks the transaction as `COMPLETED` and commits.
  - Handles idempotent replays based on existing transaction status.

- **`createInitialFundsTransaction`**
  - For a **system user**, transfers money from the system account to a target account.
  - Creates corresponding ledger entries and marks transaction as `COMPLETED` within a MongoDB session.

---

## Middlewares – Responsibilities

### `auth.middlewares.js`

- **`isLoggedIn`**
  - Reads JWT from cookie (`token`) or `Authorization: Bearer <token>`.
  - Verifies token signature and checks if token is blacklisted.
  - Loads the corresponding user from DB and attaches it to `req.user`.
  - Returns **401** if there is no token or it is blacklisted/invalid.

- **`isSystemUser`**
  - Same JWT + blacklist checks as `isLoggedIn`.
  - Additionally loads the user with `systemUser` field and enforces `systemUser === true`.
  - If not a system user → **403 Forbidden**.
  - On success, sets `req.user` and calls `next()`.

---

## Notes for Consumers

- Always send JWT either via **HTTP-only cookie** (recommended) or `Authorization` header.
- Use **unique `idempotencyKey` per client request** when creating transactions to guarantee idempotent behavior.
- Account balances are **derived from ledger entries**, not stored as a static number, which improves consistency in concurrent transaction scenarios.

