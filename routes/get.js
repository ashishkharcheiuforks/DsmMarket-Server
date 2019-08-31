const express = require('express');
const {verifyToken} = require('./middlewares');

const router = express.Router();

router.get('/nick', verifyToken, (req, res, next) => {
    return res.status(200).json({
        nick : req.app.get('user').nick,
    });
});
module.exports = router;