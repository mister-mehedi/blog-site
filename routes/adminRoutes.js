const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getPendingBlogs,
    approveBlog,
    rejectBlog,
    promoteUser,
} = require('../controllers/adminController');

const authenticateUser = require('../middleware/authentication');
const { authorizePermissions } = require('../middleware/roleHandler');

// --- Middleware arrays for cleaner route definitions ---

// Middleware to check for 'admin' or 'master' roles
const adminAndMasterAuth = [
    authenticateUser,
    authorizePermissions('admin', 'master'),
];

// Middleware to check for 'master' role only
const masterOnlyAuth = [
    authenticateUser,
    authorizePermissions('master'),
];


// --- Route Definitions ---

// These routes can be accessed by both admins and the master user
router.get('/users', adminAndMasterAuth, getAllUsers);
router.get('/blogs/pending', adminAndMasterAuth, getPendingBlogs);
router.patch('/blogs/approve/:id', adminAndMasterAuth, approveBlog);
router.patch('/blogs/reject/:id', adminAndMasterAuth, rejectBlog);

// This route can ONLY be accessed by the master user
router.patch('/users/promote/:id', masterOnlyAuth, promoteUser);


module.exports = router;

