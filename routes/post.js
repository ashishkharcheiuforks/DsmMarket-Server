const { upload, deleteFile } = require('../config/multerConfig');
const express = require('express');
const { verifyToken } = require('./middlewares');
const { User, Comment, DealPost, RentPost, Interest, ChatLog, Room, Sequelize: { Op } } = require('../models');

const router = express.Router();

router.post('/deal', verifyToken, upload.array('img'), async (req, res, next) => {
    try {
        const { title, content, category, price } = req.body;
        const { userId } = req.user;
        const { nick } = await User.findByPk(userId);
        let urls = '';

        req.files.forEach(img => {
            urls += img.location + '\n';
        });

        await DealPost.create({
            userId,
            title,
            content,
            category,
            img: urls,
            author: nick,
            price: `${Number(price).toLocaleString()}원`,
        });

        return res.status(200).json({
            success: true,
            message: 'posting success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.post('/rent', verifyToken, upload.single('img'), async (req, res, next) => {
    try {
        const { title, content, category, price, possible_time } = req.body;
        const { userId } = req.user;
        const { nick } = await User.findByPk(userId);
        const img = req.file.location;
        const flag = Number(price.split('/')[0]);

        await RentPost.create({
            img,
            title,
            content,
            category,
            userId,
            author: nick,
            price: flag ? `1시간 당 ${Number(price.split('/')[1]).toLocaleString()}원` : `1회 당 ${Number(price.split('/')[1]).toLocaleString()}원`,
            possible_time: possible_time ? possible_time : null,
        });

        return res.status(200).json({
            success: true,
            message: 'posting success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/deal', verifyToken, async (req, res, next) => {
    try {
        const { postId, title, content, price, category } = req.body;

        await DealPost.update({
            title,
            content,
            category,
            price: `${Number(price).toLocaleString()}원`,
        }, {
            where: { id: postId },
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

router.patch('/rent', verifyToken, async (req, res, next) => {
    try {
        const { postId, title, content, price, category, possible_time } = req.body;
        const flag = Number(price.split('/')[0]);

        await RentPost.update({
            title,
            content,
            category,
            price: flag ? `1시간 당 ${Number(price.split('/')[1]).toLocaleString()}원` : `1회 당 ${Number(price.split('/')[1]).toLocaleString()}원`,
            possible_time: possible_time ? possible_time : null,
        }, {
            where: { id: postId },
        });

        return res.status(200).json({
            success: true,
            message: 'edit success',
        });
    } catch (err) {
        console.error(err);
        return next();
    }
});

router.delete('/deal/:postId', verifyToken, async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { img } = await DealPost.findByPk(postId);

        img.split('\n').forEach(url => {
            if (url !== '') {
                deleteFile({
                    Bucket: 'dsmmarket',
                    Key: url.split('/')[3],
                });
            }
        });

        const { roomId } = await Room.findOne({
            where: { postId, type: 0 },
        });

        await Room.destroy({
            where: { postId, type: 0 },
        });

        await ChatLog.destroy({
            where: { roomId },
        });

        await Interest.destroy({
            where: { postId, type: 0 },
        });

        await DealPost.destroy({
            where: { postId },
        });

        return res.status(200).json({
            success: true,
            message: 'delete success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.delete('/rent/:postId', verifyToken, async (req, res, next) => {
    try {
        const { postId } = req.params;
        const { img } = await RentPost.findByPk(postId);

        deleteFile({
            Bucket: 'dsmmarket',
            Key: img.split('/')[3],
        });

        const { roomId } = await Room.findOne({
            where: { postId, type: 1 },
        });

        await Room.destroy({
            where: { postId, type: 1 },
        });

        await ChatLog.destroy({
            where: { roomId },
        });

        await Interest.destroy({
            where: { postId, type: 1 },
        });

        await RentPost.destroy({
            where: { id },
        });

        return res.status(200).json({
            success: true,
            message: 'delete success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/interest', verifyToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { postId, type } = req.body;
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (isExist) {
            await Interest.create({
                userId,
                postId,
                type,
            });

            return res.status(200).json({
                success: true,
                message: 'interest success',
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

router.patch('/uninterest', verifyToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { postId, type } = req.body;
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (isExist) {
            await Interest.destroy({ where: { userId, postId, type } });

            return res.status(200).json({
                success: true,
                message: 'uninterest success',
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

router.post('/comment', verifyToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const { postId, content, type } = req.body;
        const { email, nick } = await User.findByPk(userId);
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (isExist) {
            if (Number(type)) {
                await Comment.create({
                    email,
                    nick,
                    content,
                    rentPostId: postId,
                });
            } else {
                await Comment.create({
                    email,
                    nick,
                    content,
                    dealPostId: postId,
                });
            }

            return res.status(200).json({
                success: true,
                message: 'non-existent post',
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

module.exports = router;