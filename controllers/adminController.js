const Blog = require('../models/Blog');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

// --- Get All Users ---
const getAllUsers = async (req, res) => {
    const users = await User.find({}).select('-password');
    res.status(StatusCodes.OK).json({ users, count: users.length });
};

// --- Get Pending Blogs ---
const getPendingBlogs = async (req, res) => {
    const blogs = await Blog.find({ status: 'pending' })
        .populate('author', 'name')
        .sort('createdAt');
    res.status(StatusCodes.OK).json({ blogs, count: blogs.length });
};

// --- Approve a Blog ---
const approveBlog = async (req, res) => {
    const { id: blogId } = req.params;
    const blog = await Blog.findByIdAndUpdate(
        blogId,
        { status: 'approved', publishedAt: new Date() },
        { new: true, runValidators: true }
    );

    if (!blog) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No blog with id: ${blogId}` });
    }
    res.status(StatusCodes.OK).json({ msg: 'Blog approved successfully', blog });
};

// --- Reject a Blog ---
const rejectBlog = async (req, res) => {
    const { id: blogId } = req.params;
    const blog = await Blog.findByIdAndUpdate(
        blogId,
        { status: 'rejected', publishedAt: null },
        { new: true, runValidators: true }
    );

    if (!blog) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No blog with id: ${blogId}` });
    }
    res.status(StatusCodes.OK).json({ msg: 'Blog rejected successfully', blog });
};

// --- Promote User to Admin ---
const promoteUser = async (req, res) => {
    const { id: userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({ msg: `No user with id: ${userId}` });
    }
    if (user.userType !== 'client') {
        return res.status(StatusCodes.BAD_REQUEST).json({ msg: 'User is not a client. Cannot promote.' });
    }

    user.userType = 'admin';
    await user.save();
    res.status(StatusCodes.OK).json({ msg: `User ${user.username} has been promoted to admin.` });
};


module.exports = {
    getAllUsers,
    getPendingBlogs,
    approveBlog,
    rejectBlog,
    promoteUser,
};
