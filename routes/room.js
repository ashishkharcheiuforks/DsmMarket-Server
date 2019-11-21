const express = require('express');
const { verifyToken } = require('./middlewares');
const { User, DealPost, RentPost, Room, ChatLog, Sequelize: { Op } } = require('../models');

const router = express.Router();

router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { postId, type } = req.body;
        const user1 = req.user.email;
        const post = Number(type) ? await RentPost.findByPk(postId) : DealPost.findByPk(postId);

        if (post) {
            const room = await Room.findOne({
                where: { postId, type, user1 },
            });

            if (room) {
                return res.status(200).json({
                    roomId: room.id,
                    success: true,
                    message: 'existent room',
                });
            } else {
                const { img, author } = post;
                const { email } = await User.findOne({
                    where: { nick: author },
                });
                const { roomId } = await Room.create({
                    postId,
                    type,
                    user1,
                    user2: email,
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
        const { email } = req.user;
        const rooms = await Room.findAll({
            where: { [Op.or]: { user1: email, user2: email } },
        });
        const list = [];

        for (const room of rooms) {
            const opponent = room.user1 === email ? await User.findOne({
                where: { email: room.user2 },
            }) : await User.findOne({
                where: { email: room.user1 },
            });

            list.push({
                roomName: opponent.nick,
                picture: room.picture,
                roomId: room.roomId,
            });
        }

        return res.status(200).json({
            list,
            success : true,
            message : 'refer success',
        });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.get('/join/:roomId', verifyToken, async (req, res, next) => {
    const { roomId } = req.params;
    const { email } = req.user;
    try {
        const { postId } = await Room.findOne({
            where: { roomId },
        });

        if (postId) {
            return res.status(200).json({
                email,
                success : true,
                message : 'check success',
            });
        } else {
            return res.status(410).json({
                success : false,
                message : 'non-existent post',
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/chatLog', verifyToken, async (req, res, next) => {
    const { roomId, count } = req.query;
    const { email } = req.user;
    try {
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
            success : true,
            message : 'refer success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

module.exports = router;