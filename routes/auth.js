const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {User} = require('../models');
const {verifyToken} = require('./middlewares');
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
        return res.status(200).json({
            message : 0,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {session : false}, (authError, user) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.status(403).json({errorCode : 2});
        }
        return req.login(user, {session : false}, (loginError) => {
            if (loginError) {
                console.error(loginError);
                next(loginError);
            }
            const access_token = jwt.sign({
                email : user.email,
                nick : user.nick,
                userId : user.id,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn : '500000000m',
            });
            const refresh_token = jwt.sign({
                email : user.email,
                nick : user.nick,
                userId : user.id,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn : '10m',
            });
            return res.status(200).json({
                access_token,
                refresh_token,
                message : 1,
            });
        });
    })(req, res, next);
});
router.get('/account/auth/login', verifyToken, (req, res) => {
    return res.status(200).json({
        message : 1,
    });
});
router.post('/token', (req, res, next) => {
    try {
        const user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        const access_token = jwt.sign({
            email : user.email,
            nick : user.nick,
            userId : user.id,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn : '5m',
        });
        return res.status(200).json({
            access_token,
            message : 5,
        });
    } catch (err) {
        return res.status(401).json({
            errorCode : 4,
        })
    }
});
router.post('/password', async (req, res, next) => {
    const {email, password} = req.body;
    try {
        const exUser = await User.findOne({where : {email}});
        if (exUser) {
            const result = await bcrypt.compare(password, exUser.password);
            if (result) {
                return res.status(200).json({
                    message : 2,
                });
            }
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
module.exports = router;