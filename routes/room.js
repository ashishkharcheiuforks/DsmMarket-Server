const express = require('express');
const { verifyToken } = require('./middlewares');
const { User, DealPost, RentPost, Room, ChatLog, Sequelize: { Op } } = require('../models');

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
    try {
        const user1 = req.user.userId;
        const { postId, type } = req.body;
        const post = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (post) {
            const room = await Room.findOne({
                where: { postId, type, [Op.or]: [{ user1 }, { user2: user1 }] },
            });

            if (room) {
                return res.status(200).json({
                    roomId: room.roomId,
                    success: true,
                    message: 'existent room',
                });
            } else {
                const { img, userId } = post;
                const { roomId } = await Room.create({
                    postId,
                    type,
                    user1,
                    user2: userId,
                    picture: img.split('\n')[0],
                });

                return res.status(200).json({
                    roomId,
                    success: true,
                    message: 'make room success',
                });
            }
        } else {
            return res.status(410).json({
                success: false,
                message: 'non-existent post',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/', verifyToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const rooms = await Room.findAll({
            where: { [Op.or]: { user1: userId, user2: userId } },
        });
        const list = [];

        for (const room of rooms) {
            const { user1, user2, picture, roomId } = room;
            const { nick } = user1 === userId ? await User.findByPk(user2) : await User.findByPk(user1);

            list.push({
                roomId,
                picture,
                roomName: nick,
            });
        }

        return res.status(200).json({
            list,
            success: true,
            message: 'refer success',
        });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.get('/join/:roomId', verifyToken, async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { email } = req.user;
        const { postId } = await Room.findByPk(roomId);

        if (postId) {
            return res.status(200).json({
                email,
                success: true,
                message: 'check success',
            });
        } else {
            return res.status(410).json({
                success: false,
                message: 'non-existent post',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/chatLog', verifyToken, async (req, res, next) => {
    try {
        const { roomId, count } = req.query;
        const { email } = req.user;
        const logs = await ChatLog.findAll({
            where: { roomId },
            offset: 20 * count,
            limit: 20,
            order: [['createdAt', 'DESC']],
        });
        const list = [];

        logs.forEach(log => {
            list.push({
                me: log.email === email ? true : false,
                message: log.message,
                createdAt: log.createdAt,
            });
        });

        return res.status(200).json({
            list,
            success: true,
            message: 'refer success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;