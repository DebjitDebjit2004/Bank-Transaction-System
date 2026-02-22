/**
 * name is must be a string and must be at least 3 characters long and at most 30 characters long
 */
const isValidName = (name) => {
    return typeof name === "string" && name.length >= 3 && name.length <= 30 && /^[a-zA-Z\s]+$/.test(name);
}

/**
 * email is must be a string and must be a valid email address and must contain @ and . and must not contain any spaces and must not contain any special characters
 */
const isValidEmail = (email) => {
    return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * password is must be a string and must be at least 8 characters long and at most 30 characters long and must contain at least one uppercase letter, one lowercase letter, one number, and one special character
 */
const isValidPassword = (password) => {
    return typeof password === "string" && password.length >= 8 && password.length <= 30 && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
}

module.exports = {
    isValidName,
    isValidEmail,
    isValidPassword,
}