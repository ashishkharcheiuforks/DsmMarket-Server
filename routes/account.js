const express = require('express');
const bcrypt = require('bcrypt');
const {User, Auth} = require('../models');
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
router.patch('/password', verifyToken, async (req, res, next) => {
    const email = req.app.get('user').email;
    const authCode = req.body.authCode;
    try {
        const isSame = await Auth.findOne({
            where : {email},
            attributes : ['authCode'],
        });
        if (isSame.authCode === Number(authCode)) {
            const password = await bcrypt.hash(req.body.password, 12);
            await User.update({
                password,
            }, {
                where : {email},
            });
            return res.status(200).json({
                message : 2,
            });
        } else {
            return res.status(401).json({
                errorCode : 10,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.patch('/nick', verifyToken, async (req, res, next) => {
    const origin_nick = req.app.get('user').nick;
    const nick = req.body.nick;
    try {
        const exNick = await User.findOne({where : {nick}});
        if (exNick) {
            return res.status(403).json({
                errorCode : 1,
            });
        } else {
            await User.update({
                nick,
            }, {
                where : {nick : origin_nick},
            });
            return res.status(200).json({
                message : 2,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
module.exports = router;