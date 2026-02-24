const mongoose = require("mongoose");

/**
 * Transaction Schema
 */
const transactionSchema = new mongoose.Schema({
    fromAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must have a from account"],
        index: true
    },

    toAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: [true, "Transaction must have a to account"],
        index: true
    },

    /**
     * @description - Status of the transaction
     * @enum - PENDING, COMPLETED, FAILED, REVERSED
     * @default - PENDING
     */
    status: {
        type: String,
        enum: {
            values: ["PENDING", "SUCCESS", "FAILED", "REVERSED"],
            message: "Status can be either PENDING, COMPLETED, FAILED or REVERSED"
        },
        default: "PENDING"
    },

    amount: {
        type: Number,
        required: [true, "Amount is required for creating a transaction"],
        min: [1, "Amount must be greater than 0"]
    },

    /**
     * @description - Idempotency key is a unique key that is used to prevent duplicate transactions
     * It is used to ensure that a transaction is only processed once
     */
    idempotencyKey: {
        type: String,
        required: [true, "Idempotency key is required for creating a transaction"],
        unique: true,
        index: true
    }
    
}, {
    timestamps: true
})

const transactionModel = mongoose.model("Transaction", transactionSchema);

module.exports = transactionModel;