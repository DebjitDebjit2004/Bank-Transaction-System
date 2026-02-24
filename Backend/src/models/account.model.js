const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required to create an account"],
        index: true, // to make the search faster
    },

    status: {
        type: String,
        enum: {
            values: ["ACTIVE", "FROZEN", "CLOSED"],
            message: "Stayus can be either ACTIVE, FROZEN, or CLOSED",
        },
        default: "ACTIVE",
    },

    currency: {
        type: String,
        required: [true, "Currency is required to create an account"],
        default: "INR",
    },

}, {
    timestamps: true,
})

/**
 * Compound Index
 * user: 1 - means the index is on the user field in ascending order (for descending order, use -1)
 * status: 1 - means the index is on the status field in ascending order (for descending order, use -1)
 * this will help us to search for accounts by user and status faster
 */
accountSchema.index({user: 1, status: 1});

accountSchema.methods.getBalance = async function() {
    const balanceData = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group: {
                _id: null,
                totalDebit: {
                    $sum: {
                        $cond: [
                            { $eq: [ "$type", "DEBIT" ] },
                            "$amount",
                            0
                        ]
                    }
                },
                totalCredit: {
                    $sum: {
                        $cond: [
                            { $eq: [ "$type", "CREDIT" ] },
                            "$amount",
                            0
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 0,
                balance: { $subtract: [ "$totalCredit", "$totalDebit" ] }
            }
        }
    ])

    if (balanceData.length === 0) {
        return 0
    }

    return balanceData[ 0 ].balance
}

const accountModel = mongoose.model("Account", accountSchema);
module.exports = accountModel;