const express = require('express');
const {verifyToken} = require('./middlewares');
const {User, DealPost, RentPost, Room, ChatLog, Sequelize : {Op}} = require('../models');

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
    const {postId, type} = req.body;
    try {
        const post = Number(type) ? await RentPost.findOne({
            where: { id: postId },
        }) : await DealPost.findOne({
            where : { id :postId },
        });

        if (post) {
            const { title, img, author } = post;
    
            const user1 = req.app.get('user').email;
    
            const user2 = await User.findOne({
                where : {nick : author},
            });
    
            const {roomId} = await Room.create({
                title,
                picture : img.split('\n')[0],
                user1,
                user2 : user2.email,
            });
    
            return res.status(200).json({
                roomId,
            });
        } else {
            res.status(401).json({
                errorCode : 11,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const email = req.app.get('user').email;
        const rooms = await Room.findAll({
            where : {[Op.or] : [{user1 : email}, {user2 : email}]},
        });
        const list = [];

        rooms.forEach(room => {
            list.push({
                title : room.title,
                picture : room.picture,
                roomId : room.roomId,
            });
        });

        return res.status(200).json({
            list,
        });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.get('/join/:roomId', verifyToken, async (req, res, next) => {
    const {roomId} = req.params;
    const email = req.get('user').email;
    try {
        const {postId} = await Room.findOne({
            where : {roomId},
        });

        if (postId) {
            return res.status(200).json({
                email,
            });
        } else {
            return res.status(410).json({
                message : '삭제된 게시물',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/chatLog', verifyToken, async (req, res, next) => {
    const {roomId, count} = req.query;
    const email = req.app.get('user').email;
    try {
        const logs = await ChatLog.findAll({
            where : {roomId},
            offset : 20 * count,
            limit : 20,
            order : [['createdAt', 'DESC']],
        });
        const list = [];

        logs.forEach(log => {
            list.push({
                me : log.email === email ? true : false,
                message : log.message,
            });
        });

        return res.status(200).json({
            list,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;