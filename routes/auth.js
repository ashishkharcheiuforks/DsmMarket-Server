const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const {Auth, User} = require('../models');
const {verifyToken} = require('./middlewares');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'dsmplanb@gmail.com',
        pass : process.env.GMAIL_PASSWORD,
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {session : false}, (authError, user) => {
        if (authError) {
            console.error(authError);
            return next(authError);
        }
        if (!user) {
            return res.status(403).json({
                errorCode : 2
            });
        }
        return req.login(user, {session : false}, (loginError) => {
            if (loginError) {
                console.error(loginError);
            next(loginError);
            }
            const access_token = jwt.sign({
                email : user.email,
                userId : user.id,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn : '5m',
            });
            const refresh_token = jwt.sign({
                email : user.email,
                userId : user.id,
            },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn : '100m',
            });
            return res.status(200).json({
                access_token,
                refresh_token,
                nick : user.nick,
                message : 1,
            });
        });
    })(req, res, next);
});
router.get('/login', verifyToken, async (req, res) => {
    const password = req.query.password;
    try {
        if (password) {
            const email = req.app.get('user').email;
            const authCode = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
            const user = await User.findOne({
                where : {email},
                attributes : ['password'],
            });
            const isSame = await bcrypt.compare(password, user.password);
            if (isSame) {
                const exEmail = await Auth.findOne({where : {email}});
                if (exEmail) {
                    await Auth.update({
                        authCode,
                    }, {
                        where : {email},
                    });
                } else {
                    await Auth.create({
                        email,
                        authCode,
                    });
                }
                return res.status(200).json({
                    authCode,
                    email,
                    message : 6,
                });
            } else {
                return res.status(401).json({
                    errorCode : 3,
                });
            }
        } else {
            const email = req.app.get('user').email;
            const {nick} = await User.findOne({
                where : {email},
            });
            return res.status(200).json({
                nick,
                message : 1,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/mail', async (req, res, next) => {
    const email = req.body.email;
    const code = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
    const mailOptions = {
        from : 'dsmplanb@gmail.com',
        to : req.query.email,
        subject : '[대마장터] 인증코드를 입력하세요',
        html : `<h1>안녕하세요. 대마장터입니다.<h1>
        <h1>하단의 인증코드를 입력해주세요.<h1>
        <h3>인증코드 : ${code}<h3>`,
    };
    transporter.sendMail(mailOptions, async (err, info) => {
        if (err) {
            console.error(err);
            return next(err);
        } else {
            try {
                const exEmail = await Auth.findOne({where : {email}});
                if (exEmail) {
                    await Auth.update({
                        mailCode,
                    }, {
                        where : {email},
                    });
                } else {
                    await Auth.create({
                        email,
                        mailCode,
                    });
                }
                console.log(`Email sent : ${info.response}`);
                setTimeout(async () => {
                    await Auth.destroy({
                        where : {email},
                    });
                }, 20000);
            } catch (err) {
                console.error(err);
                return next(err);
            }
        }
    });
    return res.status(200).json({
        message : 3,
    })
});
router.post('/mail', async (req, res, next) => {
    const {email, mailCode} = req.body;
    try {
        const isSame = await Auth.findOne({where : {email}});
        if (isSame.mailCode === Number(mailCode)) {
            const str = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
            for (let i = 0; i < str.length; i++) {
                password += str[Math.floor(Math.random() * str.length)];
            }
            const tempPassword = await bcrypt.hash(password, 12);
            await User.update({
                password,
            }, {
                where: {email},
            });
            
            return res.status(200).json({
                tempPassword,
                message : 4,
            });
        } else {
            return res.status(403).json({
                errorCode : 5,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
module.exports = router;