require('express-async-errors');
const express = require('express');
const morgan = require('morgan');

// Middleware Imports
const notFoundMiddleware = require('./middleware/notFound');
const errorHandlerMiddleware = require('./middleware/errorHandler');

// Router Imports
const authRouter = require('./routes/authRoutes');
const blogRouter = require('./routes/blogRoutes');
const adminRouter = require('./routes/adminRoutes');

const app = express();

// --- Core Middleware ---
app.use(morgan('dev'));
app.use(express.json());

// --- API Routes ---
app.get('/', (req, res) => {
    res.send('<h1>Blog API</h1><p>Welcome to the blog API!</p>');
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/admin', adminRouter);

// --- Error Handling Middleware ---
// To be used after all other routes
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

module.exports = app;
