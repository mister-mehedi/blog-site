// const { StatusCodes } = require('http-status-codes');
// const { verifyJWT } = require('../utils/jwt');

// const authenticateUser = async (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid: No token provided' });
//     }

//     const token = authHeader.split(' ')[1];

//     try {
//         const payload = verifyJWT({ token, secret: process.env.JWT_SECRET });
//         req.user = { 
//             userId: payload.userId,
//             name: payload.name,
//             userType: payload.userType,
//         };
//         next();
//     } catch (error) {
//         return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Authentication invalid: Token is invalid' });
//     }
// };

// module.exports = authenticateUser;




const { StatusCodes } = require('http-status-codes');

// This function now returns another function, which is the actual middleware.
// This is a common pattern for creating flexible middleware.
const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role is included in the list of allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(StatusCodes.UNAUTHORIZED).json({ msg: 'Unauthorized to access this route' });
    }
    // If the role is authorized, proceed to the next middleware or controller
    next();
  };
};

// --- THIS IS THE FIX ---
// We are now exporting an OBJECT containing the function.
// This allows us to use destructuring { authorizePermissions } when importing.
module.exports = {
  authorizePermissions,
};

