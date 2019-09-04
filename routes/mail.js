const express = require('express');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const {User, Auth} = require('../models');
require('dotenv').config();

const router = express.Router();

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'dsmplanb@gmail.com',
        pass : process.env.GMAIL_PASSWORD,
    }
});

router.post('/send', async (req, res, next) => {
    const email = req.body.email;
    const code = Math.floor(Math.random() * (1000000 - 100000)) + 100000;
    const mailOptions = {
        from : 'dsmplanb@gmail.com',
        to : req.body.email,
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
                        code,
                    }, {
                        where : {email},
                    });
                } else {
                    await Auth.create({
                        email,
                        code,
                    });
                }
                console.log(`Email sent : ${info.response}`);
            } catch (err) {
                console.error(err);
                return next(err);
            }
        }
    });
    res.status(200).json({
        message : 3,
    })
});
router.post('/confirm', async (req, res, next) => {
    const {email, code} = req.body;
    try {
        const isSame = await Auth.findOne({where : {email}});
        if (isSame.code === Number(code)) {
            return res.status(200).json({
                message : 4,
            })
        } else {
            return res.status(403).json({
                errorCode : 5
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});router.post('/password', async (req, res, next) => {
    const {email} = req.body;
    const password = await bcrypt.hash(req.body.password, 12);
    try {
        await User.update({
            password,
        }, {
            where : {email},
        });
        return res.status(200).json({
            message : 2,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
module.exports = router;