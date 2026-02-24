const jwt = require("jsonwebtoken");
const userModel = require("../models/auth.model");
const tokenBlackListModel = require("../models/blacklist.model")

/**
 * @description Middleware to check if the user is logged in
 */
const isLoggedIn = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized Access, Please Login to access this resource",
            success: false,
            data: null,
        });
    }

    const isBlackList = await tokenBlackListModel.findOne({token});

    if (isBlackList) {
        return res.status(401).json({
            message: "Unauthorized Access, Please Login to access this resource",
            success: false,
            data: null,
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId)
        req.user = user;
        return next();

    } catch (error) {
        return res.status(500).json({
            message: "Unauthorized Access, Please Login to access this resource",
            success: false,
            data: null,
            error: error.message,
        });
    }
}

module.exports = {
    isLoggedIn
}