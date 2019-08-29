const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User} = require('../models');
require('dotenv').config();

const router = express.Router();

router.post('/join', async (req, res, next) => {
    const {email, password, nick, grade, gender} = req.body;
    try {
        const exEmail = await User.findOne({where : {email}});
        if (exEmail) {
            return res.status(403).json({errorCode : 0});
        }
        const exNick = await User.findOne({where : {nick}});
        if (exNick) {
            return res.status(403).json({errorCode : 1});
        }
        await User.create({
            email,
            password : await bcrypt.hash(password, 12),
            nick,
            grade,
            gender,
        });
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', (authError, user) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.status(403).json({errorCode : 2});
        }
        const access_token = jwt.sign({
            email : user.email,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn : '300',
        });
        const refresh_token = jwt.sign({
            email : user.email,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn : '2m',
        });
        return res.status(200).json({
            access_token,
            refresh_token,
        });
    })(req, res, next);
});
router.post('/token', (req, res, next) => {
    try {
        const email = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY).email;
        const access_token = jwt.sign({
            email,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn : '300',
        });
        return res.status(200).json({
            access_token,
        });
    } catch (err) {
        return res.sendStatus(403);
    }
});
module.exports = router;