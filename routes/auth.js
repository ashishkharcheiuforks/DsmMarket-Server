const express = require('express');
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

router.post('/login', async (req, res, next) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({ where: { email }, attributes: ['password', 'tempPassword'] });

        if (user) {
            const isTruePassword = await bcrypt.compare(password, user.password);
            const isTrueTempPassword = await bcrypt.compare(password, user.tempPassword);

            if (isTruePassword || isTrueTempPassword) {
                const access_token = jwt.sign({
                    email: user.email,
                    userId: user.id,
                },
                    process.env.JWT_SECRET_KEY,
                    {
                        expiresIn: '20m',
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
            }
        }

        return res.status(403).json({
            success: false,
            message: 'incorrect email or password',
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

router.get('/login', verifyToken, async (req, res) => {
    try {
        const { password } = req.query;

        if (password) {
            const { userId } = req.user;
            const user = await User.findByPk(userId, { attributes: ['password', 'tempPassword'] });
            const isTruePassword = await bcrypt.compare(password, user.password);
            const isTrueTempPassword = await bcrypt.compare(password, user.tempPassword);

            if (isTruePassword || isTrueTempPassword) {
                return res.status(200).json({
                    success: true,
                    message: 'login success',
                });
            } else {
                return res.status(403).json({
                    success: false,
                    message: 'incorrect password'
                });
            }
        } else {
            const { userId } = req.user;
            const { nick } = await User.findByPk(userId);

            return res.status(200).json({
                nick,
                success: true,
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
        const { email } = req.query;
        const str = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        let password = ''

        for (let i = 0; i < 10; i++) {
            password += str[Math.floor(Math.random() * str.length)];
        }

        const mailOptions = {
            from: 'dsmplanb@gmail.com',
            to: req.query.email,
            subject: '[대마장터] 임시 비밀번호를 확인하세요.',
            html: `<h1>안녕하세요. 대마장터입니다.<h1>
            <h1>하단의 임시 비밀번호로 로그인하세요.<h1>
            <h3>임시 비밀번호 : ${password}<h3>`,
        };
        const tempPassword = await bcrypt.hash(password, 12);

        await User.update({ tempPassword }, { where: { email } });

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