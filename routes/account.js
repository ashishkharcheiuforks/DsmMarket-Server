const express = require('express');
const bcrypt = require('bcrypt');
const {User, Auth} = require('../models');
const {verifyToken} = require('./middlewares');
require('dotenv').config();

const router = express.Router();

router.post('/join', async (req, res, next) => {
    const {email, password, nick, grade, gender} = req.body;
    const tempPassword = null;
    const dealLogs = JSON.stringify({
        log1 : 0,
        log2 : 0,
        log3 : 0,
        log4 : 0,
        log5 : 0,
        log6 : 0,
        log7 : 0,
        log8 : 0,
        log9 : 0,
        log10 : 0,
    });
    const rentLogs = dealLogs;
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
            tempPassword,
            nick,
            grade,
            gender,
            dealLogs,
            rentLogs,
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
    try {
        const password = await bcrypt.hash(req.body.password, 12);
        await User.update({
            password,
        }, {
            where: { email },
        });
        await Auth.destroy({
            where: { email },
        });
        return res.status(200).json({
            message: 2,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.patch('/nick', verifyToken, async (req, res, next) => {
    const {email} = req.app.get('user');
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
                where : {email},
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