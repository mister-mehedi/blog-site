const { body } = require('express-validator');

const validateRegistration = [
    body('name').notEmpty().withMessage('Name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

const validateBlog = [
    body('title').notEmpty().withMessage('Title is required'),
    body('body').notEmpty().withMessage('Body content is required'),
];

module.exports = {
    validateRegistration,
    validateLogin,
    validateBlog,
};
