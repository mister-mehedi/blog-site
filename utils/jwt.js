const jwt = require('jsonwebtoken');

const createJWT = ({ payload, secret, expiresIn }) => {
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
};

const verifyJWT = ({ token, secret }) => {
    return jwt.verify(token, secret);
};

module.exports = {
    createJWT,
    verifyJWT,
};
