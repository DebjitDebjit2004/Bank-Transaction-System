const mongoose = require('mongoose');
const accountModel = require("../models/account.model.js");
const transactionModel = require("../models/transaction.model.js");
const ledgerModel = require("../models/ledger.model.js");


/**
 * - Create a new transaction
 * THE 10-STEP TRANSFER FLOW:
     * 1. Validate request
     * 2. Validate idempotency key
     * 3. Check account status
     * 4. Derive sender balance from ledger
     * 5. Create transaction (PENDING)
     * 6. Create DEBIT ledger entry
     * 7. Create CREDIT ledger entry
     * 8. Mark transaction COMPLETED
     * 9. Commit MongoDB session
 */
const crateTransaction = async (req, res) => {

    /**
     * 1. Validate request 
     * @description: check if from account, to account, amount and idempotency key are required
     */
    const {fromAccount, toAccount, amount, idempotencyKey} = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "From account, to account, amount and idempotency key are required",
            success: false,
            status: "Bad Request",
            data: null,
            error: "From account, to account, amount and idempotency key are required",
        })
    }

    /**
     * @description: find the from account by its id
     */
    const fromUserAccount = await accountModel.findOne({
        _id: fromAccount,
    })

    /**
     * @description: find the to account by its id
     */
    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    /**
     * @description: check if from account and to account are found
     */
    if (!fromUserAccount || !toUserAccount) {
        return res.status(400).json({
            message: "From account or to account not found",
            success: false,
            status: "Bad Request",
            data: null,
            error: "From account or to account not found",
        })
    }

    /**
     * 2. Validate idempotency key
     * @description: check if transaction already exists
     */
    const isTransactionAlreadyExists = await transactionModel.findOne({
        idempotencyKey: idempotencyKey,
    })

    if (isTransactionAlreadyExists) {

        /**
         * @description: check if transaction is already processed
         */
        if (isTransactionAlreadyExists.status === "SUCCESS") {
            return res.status(201).json({
                message: "Transaction already processed",
                transaction: isTransactionAlreadyExists
            })
        }

        /**
         * @description: check if transaction is still processing
         */
        if (isTransactionAlreadyExists.status === "PENDING") {
            return res.status(102).json({
                message: "Transaction is still processing"
            })
        }

        /**
         * @description: check if transaction processing failed
         */
        if (isTransactionAlreadyExists.status === "FAILED") {
            return res.status(500).json({
                message: "Transaction processing failed, please retry"
            })
        }

        /**
         * @description: check if transaction was reversed
         */
        if (isTransactionAlreadyExists.status === "REVERSED") {
            return res.status(500).json({
                message: "Transaction was reversed, please retry"
            })
        }
    }

    /**
     * 3. Check account status
     * @description: check if from account and to account are active
     */
    if (fromUserAccount.status !== "ACTIVE" || toUserAccount.status !== "ACTIVE") {
        return res.status(400).json({
            message: "From account or to account is not active",
            success: false,
            status: "Bad Request",
            data: null,
            error: "From account or to account is not active",
        })
    }

    /**
     * 4. Derive sender balance from ledger
     * @description: check if sender has enough balance
     */
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
            success: false,
            status: "Bad Request",
            data: null,
            error: "Insufficient balance",
        })
    }

    /**
     * 5. Create transaction (PENDING)
     */

    let transaction;
    let session;

    try {
        session = await mongoose.startSession();
        session.startTransaction();

        transaction = (await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING"
        }], {session}))[0];

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            amount,
            transaction: transaction._id,
            type: "DEBIT",
        }], { session });

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            amount,
            transaction: transaction._id,
            type: "CREDIT",
        }], { session });

        await transactionModel.findOneAndUpdate({_id: transaction._id}, {status: "COMPLETED"}, {session});

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            message: "Transaction created successfully",
            transaction: transaction,
            ledgerEntries: [debitLedgerEntry, creditLedgerEntry],
            success: true,
            status: "Success",
            error: null,
        })
    } catch (error) {
        if (session) {
            await session.abortTransaction().catch(() => {});
            session.endSession();
        }
        return res.status(400).json({
            message: "Transaction failed due to some issue, please retry after sometime",
            error: error.message,
        })
    }
}

const createInitialFundsTransaction = async (req, res) => {
    const { toAccount, amount, idempotencyKey } = req.body

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: "toAccount, amount and idempotencyKey are required"
        })
    }

    const toUserAccount = await accountModel.findOne({
        _id: toAccount,
    })

    if (!toUserAccount) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    })

    if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }


    const session = await mongoose.startSession()
    session.startTransaction()

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    })

    const debitLedgerEntry = await ledgerModel.create([ {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
    } ], { session })

    const creditLedgerEntry = await ledgerModel.create([ {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
    } ], { session })

    transaction.status = "COMPLETED"
    await transaction.save({ session })

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message: "Initial funds transaction completed successfully",
        transaction: transaction
    })


}

module.exports = {
    crateTransaction,
    createInitialFundsTransaction,
}