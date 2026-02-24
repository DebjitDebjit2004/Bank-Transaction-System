const mongoose = require("mongoose");

/**
 * @description Schema to blacklist a token
 * @field token - The token to blacklist
 */
const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required to blacklist a token"],
        unique: [true, "Token is already blacklisted"],
    }
}, {
    timestamps: true,
})

tokenBlacklistSchema.index({ createdAt: 1 }, {
    expireAfterSeconds: 60 * 60 * 24 * 3, // 3 days
})

const tokenBlackListModel = mongoose.model("tokenBlacklist", tokenBlacklistSchema);
module.exports = tokenBlackListModel;