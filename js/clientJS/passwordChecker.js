/**
 * Checks if the password is secure
 * Requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * @param password the password to check
 * @returns {boolean} true if the password is secure, false otherwise
 */
function isPasswordSecure(password) {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    return passwordRegex.test(password);
}

module.exports = { isPasswordSecure };