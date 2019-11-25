const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.verifyToken = (req, res, next) => {
    try {
        const userInfo = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        req.user = userInfo;
        next();
    } catch (err) {
        res.status(401).json({
            success: false,
            refresh: false,
            message: 'access token is expired',
        });
    }
};