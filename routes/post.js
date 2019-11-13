const {upload, deleteFile} = require('../config/multerConfig');
const express = require('express');
const {verifyToken} = require('./middlewares');
const {User, Comment, DealPost, RentPost, Interest, ChatLog, Room, Sequelize : {Op}} = require('../models');

const router = express.Router();

router.post('/deal', verifyToken, upload.array('img'), async (req, res, next) => {
    let urls = '';
    req.files.forEach(img => {
        urls += img.location + '\n';
    });
    const {title, content, category} = req.body;
    const price = Number(req.body.price).toLocaleString();
    const {email} = req.user;
    try {
        const {id, nick} = await User.findOne({
            where : {email},
        });
        await DealPost.create({
            author : nick,
            img : urls,
            title,
            content,
            price,
            category,
            userId : id,
        });
        return res.status(200).json({
            message : 7,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.post('/rent', verifyToken, upload.single('img'), async (req, res, next) => {
    const img = req.file.location;
    const {title, content, category} = req.body;
    const price = req.body.price;
    const {email} = req.user;
    try {
        const {id, nick} = await User.findOne({
            where : {email},
        });
        await RentPost.create({
            author : nick,
            img,
            title,
            content,
            price,
            category,
            userId : id,
            possible_time : req.body.possible_time ? req.body.possible_time : null,
        });
        return res.status(200).json({
            message : 7,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/deal', verifyToken, async (req, res, next) => {
    const {postId, title, content, price, category} = req.body;
    try {
        await DealPost.update({
            title,
            content,
            price,
            category,
        }, {
            where : {id : postId},
        });
        return res.status(200).json({
            message : 2,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/rent', verifyToken, async (req, res, next) => {
    const {postId, title, content, price, category, possible_time} = req.body;
    try {
        await RentPost.update({
            title,
            content,
            price,
            category,
            possible_time,
        }, {
            where : {id : postId},
        });
        return res.status(200).json({
            message : 2,
        });
    } catch (err) {
        console.error(err);
        return next();
    }
});

router.delete('/deal/:postId', verifyToken, async (req, res, next) => {
    const id = req.params.postId;
    try {
        const {img} = await DealPost.findOne({
            where : {id},
        });
        img.split('\n').forEach(url => {
            if (url !== '') {
                deleteFile({
                    Bucket : 'dsmmarket',
                    Key : url.split('/')[3],
                });
            }
        });
        const {roomId} = await Room.findOne({
            where : {[Op.and] : [{postId : id}, {type : 0}]},
        });
        await Room.destroy({
            where : {[Op.and] : [{postId : id}, {type : 0}]},
        });
        await ChatLog.destroy({
            where : {roomId},
        });
        await DealPost.destroy({
            where : {id},
        });
        return res.status(200).json({
            message : 14,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.delete('/rent/:postId', verifyToken, async (req, res, next) => {
    const id = req.params.postId;
    try {
        const {img} = await RentPost.findOne({
            where : {id},
        });
        deleteFile({
            Bucket : 'dsmmarket',
            Key : img.split('/')[3],
        });
        const {roomId} = await Room.findOne({
            where : {[Op.and] : [{postId : id}, {type : 1}]},
        });
        await Room.destroy({
            where : {[Op.and] : [{postId : id}, {type : 1}]},
        });
        await ChatLog.destroy({
            where : {roomId},
        });
        await RentPost.destroy({
            where : {id},
        });
        return res.status(200).json({
            message : 14,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.patch('/interest', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.user;
        const {postId, type} = req.body;
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (isExist) {
            await Interest.create({
                userId,
                postId,
                type,
            });

            return res.status(200).json({
                success : true,
                message : 'interest success',
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

router.patch('/uninterest', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.user;
        const {postId, type} = req.body;
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (isExist) {
            await Interest.destroy({where : {userId, postId, type}});

            return res.status(200).json({
                success : true,
                message : 'uninterest success',
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

router.post('/comment', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.user;
        const {postId, content, type} = req.body;
        const {email, nick} = await User.findByPk(userId);
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);
        
        if(isExist) {
            if (Number(type)) {
                await Comment.create({
                    email,
                    nick,
                    content,
                    rentPostId : postId,
                });
            } else {
                await Comment.create({
                    email,
                    nick,
                    content,
                    dealPostId : postId,
                });
            }

            return res.status(200).json({
                message : 12,
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
module.exports = router;
