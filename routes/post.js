const upload = require('../config/multerConfig');
const express = require('express');
const {verifyToken} = require('./middlewares');
const {User, DealPost, RentPost, Hashtag, Interest} = require('../models');

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
        next(err);
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
        next(err);
    }
});
router.patch('/interest', verifyToken, async (req, res, next) => {
    const userId = req.app.get('user').userId;
    const {postId, type} = req.body;
    try {
        await Interest.create({
            userId,
            postId,
            type,
        });
        return res.status(200).json({
            message : 8,
        });
    } catch (err) {
        console.error(err);
        next(err);
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
        next(err);
    }
});
module.exports = router;