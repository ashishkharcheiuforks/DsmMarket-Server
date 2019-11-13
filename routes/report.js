const express = require('express');
const {verifyToken} = require('./middlewares');
const nodemailer = require('nodemailer');
const moment = require('moment');
require('dotenv').config();

const router = express.Router();
const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : 'dsmplanb@gmail.com',
        pass : process.env.GMAIL_PASSWORD,
    },
});

router.post('/post', verifyToken, async (req, res, next) => {
    try {
        const { postId, type, reason } = req.body;
        const mailOptions = {
            from: 'dsmplanb@gmail.com',
            to: 'dsmplanb@gmail.com',
            subject: moment().format("YYYY년 MM월 DD일 HH시 mm분 게시물 신고"),
            text: `신고자 ID :${req.app.get('user').email}
            게시물 타입 : ${Number(type) ? '대여글' : '거래글'}
            게시물 ID : ${postId}
            신고사유 : ${reason}`,
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            success: true,
            message : 'report success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.post('/comment', verifyToken, async (req, res, next) => {
    try {
        const { postId, type, nick, reason } = req.body;
        const mailOptions = {
            from: 'dsmplanb@gmail.com',
            to: 'dsmplanb@gmail.com',
            subject: moment().format("YYYY년 MM월 DD일 HH시 mm분 댓글 신고"),
            text: `신고자 ID :${req.app.get('user').email}
            게시물 타입 : ${Number(type) ? '대여글' : '거래글'}
            게시물 ID : ${postId}
            댓글 작성자 : ${nick}
            사유 : ${reason}`,
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            success: true,
            message : 'report success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;