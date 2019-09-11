const upload = require('../config/multerConfig');
const express = require('express');
const {verifyToken} = require('./middlewares');
const {Comment, DealPost, RentPost, Hashtag, Interest} = require('../models');

const router = express.Router();

router.post('/deal', verifyToken, upload.array('img'), async (req, res, next) => {
    let urls = '';
    req.files.forEach(img => {
        urls += img.location + '\n';
    });
    const {title, content, category} = req.body;
    const price = Number(req.body.price).toLocaleString();
    const tags = req.body.tag.match(/#[^\s]*/g);
    const userId = req.app.get('user').userId;
    try {
        const post = await DealPost.create({
            author : req.app.get('user').nick,
            img : urls,
            title,
            content,
            price,
            category,
            userId,
        });
        const hashtags = await Promise.all(tags.map(tag => Hashtag.findOrCreate({
            where : {title : tag.slice(1).toLowerCase()},
        })));
        await post.addHashtags(hashtags.map(tag => tag[0]));
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
    const tags = req.body.tag.match(/#[^\s]*/g);
    const userId = req.app.get('user').userId;
    try {
        const post = await RentPost.create({
            author : req.app.get('user').nick,
            img,
            title,
            content,
            price,
            category,
            userId,
            possible_time : req.body.possible_time ? req.body.possible_time : null,
        });
        const hashtags = await Promise.all(tags.map(tag => Hashtag.findOrCreate({
            where : {title : tag.slice(1).toLowerCase()},
        })));
        await post.addHashtags(hashtags.map(tag => tag[0]));
        res.status(200).json({
            message : 7,
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
router.post('/comment', async (req, res, next) => {
    const {postId, nick, content, type} = req.body;
    try {
        if (Number(type)) {
            await Comment.create({
                nick,
                content,
                rentPostId : postId,
            });
        } else {
            await Comment.create({
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