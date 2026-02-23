const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is Required for Opening an Account"],
        trim: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: function(value) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            },
            message: "Invalid Email Address",
        },
    },

    name: {
        type: String,
        required: [true, "Name is Required for Opening an Account"],
        trim: true,
        minlength: [3, "Name must be at least 3 characters long"],
        maxlength: [30, "Name must be at most 30 characters long"],
    },

    password: {
        type: String,
        required: [true, "Password is Required for Opening an Account"],
        minlength: [8, "Password must be at least 8 characters long"],
        maxlength: [30, "Password must be at most 30 characters long"],
        validate: {
            validator: function(value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
        },
        select: false,
    }
    
}, {
    timestamps: true,
})

/**
 * Pre-save middleware to hash the password
 * before saving the user to the database
 */
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const hash = await bcrypt.hash(this.password, 10)
    this.password = hash;

    return;
})

/**
 * Method to compare the password with the hashed password
 * used to login a user
 */
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);

module.exports = User;