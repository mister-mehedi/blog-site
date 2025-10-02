const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title'],
        trim: true,
    },
    body: {
        type: String,
        required: [true, 'Please provide content for the blog post'],
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    publishedAt: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Blog', BlogSchema);
