const { StatusCodes } = require('http-status-codes');
const { verifyJWT } = require('../utils/jwt');

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyJWT({ token, secret: process.env.JWT_SECRET });
        req.user = { 
            userId: payload.userId,
            name: payload.name,
            userType: payload.userType,
        };
        next();
    } catch (error) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid: Token is invalid' });
    }
};

module.exports = authenticateUser;
