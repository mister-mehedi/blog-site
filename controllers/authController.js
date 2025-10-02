const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');
// const { createJWT, verifyJWT } = require('../utils/jwt');
const { createJWT,verifyJWT } = require('../utils/jwt');

// --- Register ---
const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { name, username, password } = req.body;

    const user = await User.create({ name, username, password });
    res.status(StatusCodes.CREATED).json({
        user: { name: user.name, username: user.username },
        msg: 'User created successfully'
    });
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials provided.' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials provided.' });
    }
    
    // --- FIX: Correctly pass secret and lifetime from process.env ---
    const accessToken = createJWT({
        payload: { userId: user._id, name: user.name, role: user.userType },
        secret: process.env.JWT_SECRET, // <-- This was missing
        expiresIn: process.env.JWT_LIFETIME // <-- This was missing
    });

    res.status(StatusCodes.OK).json({
        user: { name: user.name, username: user.username, role: user.userType },
        accessToken,
    });
};

// const login = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
//     }

//     const { username, password } = req.body;
//     const user = await User.findOne({ username });

//     if (!user) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials provided.' });
//     }

//     const isPasswordCorrect = await user.comparePassword(password);
//     if (!isPasswordCorrect) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials provided.' });
//     }
    
//     // --- FIX: The login block has been removed ---
//     // The previous security check that was here is now gone,
//     // allowing the initial login.

//     const accessToken = createJWT({
//         payload: { userId: user._id, name: user.name, role: user.userType },
//     });

//     res.status(StatusCodes.OK).json({
//         user: { name: user.name, username: user.username, role: user.userType },
//         accessToken,
//     });
// };

// // --- Login ---
// const login = async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
//     }

//     const { username, password } = req.body;
//     const user = await User.findOne({ username });

//     if (!user) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });
//     }

//     const isPasswordCorrect = await user.comparePassword(password);
//     if (!isPasswordCorrect) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid credentials' });
//     }

//     // Special check for initial master user password
//     if (user.userType === 'master' && password === 'master123') {
//         return res.status(StatusCodes.FORBIDDEN).json({
//             msg: 'This is the default master password. Please change it using a secure endpoint before logging in.'
//         });
//     }

//     const userPayload = {
//         userId: user._id,
//         name: user.name,
//         userType: user.userType,
//     };

//     // Create Refresh Token
//     const refreshToken = createJWT({ payload: userPayload, secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_LIFETIME });
    
//     // Invalidate any existing tokens for this user
//     await Token.findOneAndUpdate({ user: user._id }, { refreshToken, isValid: true }, { new: true, upsert: true });

//     // Create Access Token
//     const accessToken = createJWT({ payload: userPayload, secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_ACCESS_LIFETIME });
    
//     res.status(StatusCodes.OK).json({ user: userPayload, accessToken, refreshToken });
// };


// --- NEW FUNCTION: To securely update the password ---
const updatePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Please provide both old and new passwords.' });
    }

    // req.user.userId is available from the 'authenticateUser' middleware
    const user = await User.findOne({ _id: req.user.userId });

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid old password.' });
    }

    // The new password will be automatically hashed by the pre-save hook in the User model
    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Success! Password updated.' });
};


// --- Refresh Token ---
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'Please provide a refresh token' });
    }

    const payload = verifyJWT({ token: refreshToken, secret: process.env.JWT_REFRESH_SECRET });
    
    if (!payload) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Invalid refresh token' });
    }

    const existingToken = await Token.findOne({
        user: payload.userId,
        refreshToken,
    });
    
    if (!existingToken || !existingToken.isValid) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid' });
    }
    
    const userPayload = {
        userId: payload.userId,
        name: payload.name,
        userType: payload.userType,
    };

    const accessToken = createJWT({ payload: userPayload, secret: process.env.JWT_SECRET, expiresIn: process.env.JWT_ACCESS_LIFETIME });
    
    res.status(StatusCodes.OK).json({ accessToken });
};


// --- Logout ---
const logout = async (req, res) => {
    const { userId } = req.user;
    await Token.findOneAndUpdate({ user: userId }, { isValid: false, refreshToken: '' });
    res.status(StatusCodes.OK).json({ msg: 'User logged out successfully' });
};


module.exports = {
    register,
    login,
    logout,
    refreshToken,
    updatePassword,
};
