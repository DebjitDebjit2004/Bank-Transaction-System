const userModel = require("../models/auth.model.js");
const { isValidEmail, isValidPassword, isValidName } = require("../validations/auth.validations.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/**
 * Register a new user
 * - /api/v1/auth/register
 */
const userRegisterController = async (req, res) => {
    const {email, name, password} = req.body;

    if (!email || !name || !password) {
        return res.status(400).json({
            message: "All fields are required",
            status: "Failed to Register",
            success: false,
        })
    }

    if (!isValidName(name)) {
        return res.status(400).json({
            message: "Name is not valid",
            status: "Failed to Register",
            success: false,
        })
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Email is not valid",
            status: "Failed to Register",
            success: false,
        })
    }
    
    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: "Password is not valid",
            status: "Failed to Register",
            success: false,
        })
    }

    const isUserExist = await userModel.findOne({email: email});

    if (isUserExist) {
        return res.status(400).json({
            message: "User is already registered with this email address",
            status: "Failed to Register",
            success: false,
        })
    }

    const user = await userModel.create({
        email,
        name,
        password,
    });

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

    return res.status(201).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        message: "User registered successfully",
        status: "Registered Successfully",
        success: true,
        token,
    })
}

/**
 * Login a user
 * - /api/v1/auth/login
 */
const userLoginController = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required",
            status: "Failed to Login",
            success: false,
        })
    }
    
    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Email is not valid",
            status: "Failed to Login",
            success: false,
        })
    }
    
    if (!isValidPassword(password)) {
        return res.status(400).json({
            message: "Password is not valid",
            status: "Failed to Login",
            success: false,
        })
    }
    
    const user = await userModel.findOne({email: email}).select("+password");

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password",
            status: "Failed to Login",
            success: false,
        })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid email or password",
            status: "Failed to Login",
            success: false,
        })
    }

    const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {expiresIn: "1d"});

    return res.status(200).json({
        user: {
            id: user._id,
            email: user.email,
            name: user.name,
        },
        message: "User logged in successfully",
        status: "Logged in Successfully",
        success: true,
        token,
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
}