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

module.exports = {
    createAccountController
}