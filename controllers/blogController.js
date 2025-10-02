const Blog = require('../models/Blog');
const { StatusCodes } = require('http-status-codes');
const { validationResult } = require('express-validator');

// --- Create Blog ---
const createBlog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }

    const { title, body } = req.body;
    const author = req.user.userId;

    const blogData = { title, body, author };

    // Admins/Master posts are auto-approved
    if (req.user.userType === 'admin' || req.user.userType === 'master') {
        blogData.status = 'approved';
        blogData.publishedAt = new Date();
    }

    const blog = await Blog.create(blogData);
    res.status(StatusCodes.CREATED).json({ blog });
};

// --- Get All Approved Blogs (Public) ---
const getAllBlogs = async (req, res) => {
    const blogs = await Blog.find({ status: 'approved' })
        .populate('author', 'name') // Populate author's name
        .sort('-publishedAt');
    res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
};

// --- Get Single Approved Blog (Public) ---
const getSingleBlog = async (req, res) => {
    const { id: blogId } = req.params;
    const blog = await Blog.findOne({ _id: blogId, status: 'approved' })
        .populate('author', 'name');

    if (!blog) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No approved blog with id: ${blogId}` });
    }
    res.status(StatusCodes.OK).json({ blog });
};

// --- Get All Blogs by Logged-in User ---
const getMyBlogs = async (req, res) => {
    const blogs = await Blog.find({ author: req.user.userId }).sort('-createdAt');
    res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
}

// --- Update Blog ---
const updateBlog = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ errors: errors.array() });
    }
    
    const { id: blogId } = req.params;
    const { title, body } = req.body;
    const { userId, userType } = req.user;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No blog with id: ${blogId}` });
    }

    // Check permissions: either the author or an admin/master can update
    if (blog.author.toString() !== userId && userType !== 'admin' && userType !== 'master') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Not authorized to update this blog post' });
    }

    blog.title = title;
    blog.body = body;

    // If a client updates their post, it goes back to pending for re-approval
    if (userType === 'client') {
        blog.status = 'pending';
        blog.publishedAt = null;
    }

    await blog.save();
    res.status(StatusCodes.OK).json({ blog });
};


// --- Delete Blog ---
const deleteBlog = async (req, res) => {
    const { id: blogId } = req.params;
    const { userId, userType } = req.user;

    const blog = await Blog.findById(blogId);

    if (!blog) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No blog with id: ${blogId}` });
    }

    // Check permissions: either the author or an admin/master can delete
    if (blog.author.toString() !== userId && userType !== 'admin' && userType !== 'master') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Not authorized to delete this blog post' });
    }

    await blog.remove();
    res.status(StatusCodes.OK).json({ msg: 'Blog post deleted successfully' });
};

module.exports = {
    createBlog,
    getAllBlogs,
    getSingleBlog,
    getMyBlogs,
    updateBlog,
    deleteBlog,
};
