const jwt = require('jsonwebtoken');

exports.verifyToken = async (req, res, next) => {
    try {
        const isValid = jwt.verify(req.body.access_token, process.env.JWT_SECRET_KEY);
        if (isValid) {
            next();
        } else {
            res.sendStatus(403);
        }
    } catch (err) {
        console.loe(err);
        next(err);
    }
};