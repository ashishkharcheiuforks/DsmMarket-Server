const express = require('express');
const bcrypt = require('bcrypt');
const { User, DealPost, RentPost, Comment } = require('../models');
const { verifyToken } = require('./middlewares');
require('dotenv').config();

const router = express.Router();

router.post('/join', async (req, res, next) => {
    try {
        const { email, nick } = req.body;

        const exEmail = await User.findOne({ where: { email } });
        const exNick = await User.findOne({ where: { nick } });

        if (exEmail) {
            return res.status(403).json({
                success: false,
                message: 'existent email',
            });
        }
        else if (exNick) {
            return res.status(403).json({
                success: false,
                message: 'existent nick',
            });
        } else {
            const { password, grade, gender } = req.body;
            const tempPassword = null;
            const dealLogs = JSON.stringify({
                logs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            });
            const rentLogs = dealLogs;
            await User.create({
                email,
                tempPassword,
                nick,
                grade,
                gender,
                dealLogs,
                rentLogs,
                password: await bcrypt.hash(password, 12),
            });

            return res.status(200).json({
                success: true,
                message: 'join success',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/password', verifyToken, async (req, res, next) => {
    try {
        const { email } = req.user;
        const password = await bcrypt.hash(req.body.password, 12);

        await User.update({
            password,
        }, {
            where: { email },
        });

        return res.status(200).json({
            success: true,
            message: 'edit success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/nick', verifyToken, async (req, res, next) => {
    try {
        const { userId, email } = req.user;
        const { nick } = req.body;
        const exNick = await User.findOne({ where: { nick } });

        if (exNick) {
            return res.status(403).json({
                success: false,
                message: 'existent nick',
            });
        } else {
            await DealPost.update({
                author: nick,
            }, {
                where: { userId },
            });

            await RentPost.update({
                author: nick,
            }, {
                where: { userId },
            });

            await Comment.update({
                nick,
            }, {
                where: { email },
            });

            await User.update({
                nick,
            }, {
                where: { email },
            });

            return res.status(200).json({
                success: true,
                message: 'edit success',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;