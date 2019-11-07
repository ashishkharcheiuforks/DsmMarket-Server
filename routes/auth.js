const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { verifyToken } = require('./middlewares');
require('dotenv').config();

const router = express.Router();
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'dsmplanb@gmail.com',
        pass: process.env.GMAIL_PASSWORD,
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (authError, user) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.status(403).json({
                success: false,
                message: 'incorrect email or password',
            });
        }
        return req.login(user, { session: false }, (loginError) => {
            if (loginError) {
                console.error(loginError);
                next(loginError);
            }
            const access_token = jwt.sign({
                email: user.email,
                userId: user.id,
            },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '5m',
                });
            const refresh_token = jwt.sign({
                email: user.email,
                userId: user.id,
            },
                process.env.JWT_SECRET_KEY,
                {
                    expiresIn: '100m',
                });
            return res.status(200).json({
                access_token,
                refresh_token,
                nick: user.nick,
                message: 'login success',
            });
        });
    })(req, res, next);
});

router.get('/login', verifyToken, async (req, res) => {
    try {
        const password = req.query.password;

        if (password) {
            const email = req.app.get('user').email;
            const user = await User.findOne({
                where: { email },
                attributes: ['password'],
            });
            const isSame1 = await bcrypt.compare(password, user.password);

            if (user.tempPassword) {
                const isSame2 = await bcrypt.compare(password, user.tempPassword);

                if (isSame1 | isSame2) {
                    return res.status(200).json({
                        success: true,
                        message: 'auth success',
                    });
                } else {
                    return res.status(403).json({
                        success: false,
                        message: 'incorrect password'
                    });
                }
            } else {
                if (isSame1) {
                    return res.status(200).json({
                        success: true,
                        message: 'auth success',
                    });
                } else {
                    return res.status(403).json({
                        success: false,
                        message: 'incorrect password'
                    });
                }
            }

        } else {
            const email = req.app.get('user').email;
            const { nick } = await User.findOne({
                where: { email },
            });

            return res.status(200).json({
                success: true,
                nick,
                message: 'login success',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/mail', async (req, res, next) => {
    try {
        const email = req.query.email;
        const str = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        let password = [];

        for (let i = 0; i < str.length; i++) {
            password += str[Math.floor(Math.random() * str.length)];
        }

        const mailOptions = {
            from: 'dsmplanb@gmail.com',
            to: req.query.email,
            subject: '[대마장터] 임시 비밀번호를 확인하세요.',
            html: `<h1>안녕하세요. 대마장터입니다.<h1>
        <h1>하단의 임시 비밀번호로 로그인하세요.<h1>
        <h3>인증코드 : ${password}}<h3>`,
        };
        const tempPassword = await bcrypt.hash(password, 12);

        await User.update({
            tempPassword,
        }, {
            where: { email },
        });

        await transporter.sendMail(mailOptions);

        return res.status(200).json({
            success: true,
            message: 'send success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;