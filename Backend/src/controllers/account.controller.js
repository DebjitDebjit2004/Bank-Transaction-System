const accountModel = require("../models/account.model");

/**
 * @description Controller to create a new account for a user
 * @route POST /api/account/create-new
 * @access Private
 */
const createAccountController = async (req, res) => {
    const user = req.user;
    console.log(user);

    const account = await accountModel.create({
        user: user._id,
    })

    return res.status(201).json({
        message: "Account created successfully",
        success: true,
        data: account,
    })
}

/**
 * @description Controller to get all accounts of a user
 * @route GET /api/account/get-all
 * @access Private
 */
const getAllAccountsController = async (req, res) => {
    const user = req.user;

    const accounts = await accountModel.find({ user: user._id });

    return res.status(200).json({
        message: "Accounts fetched successfully",
        success: true,
        data: accounts,
        status: "Success",
        error: null,
    })
}

/**
 * @description Controller to get bank balance of a user
 * @route GET /api/account/get-bank-balance/:accountId
 * @access Private
 */
const getAccountBankBalanceController = async (req, res) => {
    const { accountId } = req.params;
    const user = req.user;

    const account = await accountModel.findOne({
        _id: accountId,
        user: user._id,
    })

    if (!account) {
        return res.status(404).json({
            message: "Account not found",
            success: false,
            data: null,
            status: "Not Found",
            error: "Account not found",
        })
    }

    const balance = await account.getBalance();

    return res.status(200).json({
        message: "Account bank balance fetched successfully",
        success: true,
        data: balance,
        status: "Success",
        error: null,
    })
}

module.exports = {
    createAccountController,
    getAllAccountsController,
    getAccountBankBalanceController,
}