const {upload, deleteFile} = require('../config/multerConfig');
const express = require('express');
const {verifyToken} = require('./middlewares');
const {User, Comment, DealPost, RentPost, Interest} = require('../models');

const router = express.Router();

router.post('/deal', verifyToken, upload.array('img'), async (req, res, next) => {
    let urls = '';
    req.files.forEach(img => {
        urls += img.location + '\n';
    });
    const {title, content, category} = req.body;
    const price = Number(req.body.price).toLocaleString();
    const email = req.app.get('user').email;
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
        res.status(200).json({
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
    const email = req.app.get('user').email;
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
        res.status(200).json({
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
                urls.push(url);
                deleteFile({
                    Bucket : 'dsmmarket',
                    Key : url.split('/')[3],
                });
            }
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
        await RentPost.destory({
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
    const userId = req.app.get('user').userId;
    const {postId, type} = req.body;
    try {
        const isExist = Number(type) ? await RentPost.findOne({
            where : {id : postId},
        }) : await DealPost.findOne({
            where : {id : postId},
        });
        if (isExist) {
            await Interest.create({
                userId,
                postId,
                type,
            });
            return res.status(200).json({
                message : 8,
            });
        } else {
            return res.status(410).json({
                errorCode : 11,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.patch('/uninterest', verifyToken, async (req, res, next) => {
    const userId = req.app.get('user').userId;
    const {postId, type} = req.body;
    try {
        await Interest.destroy({where : {userId, postId, type}});
        return res.status(200).json({
            message : 8,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.post('/comment', verifyToken, async (req, res, next) => {
    const {email, nick} = req.app.get('user');
    const {postId, content, type} = req.body;
    try {
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
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
module.exports = router;
