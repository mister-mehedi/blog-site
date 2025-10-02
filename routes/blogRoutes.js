const express = require('express');
const router = express.Router();
const {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    updateBlog,
    deleteBlog,
    getMyBlogs,
} = require('../controllers/blogController');
const { validateBlog } = require('../middleware/validator');
const authenticateUser = require('../middleware/authentication');

router.route('/')
    .post(authenticateUser, validateBlog, createBlog)
    .get(getAllBlogs); // Public route

router.route('/my-blogs').get(authenticateUser, getMyBlogs); // Get blogs of the logged-in user

router.route('/:id')
    .get(getSingleBlog) // Public route
    .patch(authenticateUser, validateBlog, updateBlog)
    .delete(authenticateUser, deleteBlog);

module.exports = router;
