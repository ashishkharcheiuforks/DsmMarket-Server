const express = require('express');
const jwt = require('jsonwebtoken');
const { verifyToken } = require('./middlewares');
const axios = require('axios');
const { User, DealPost, RentPost, Comment, Interest, sequelize, Sequelize: { Op } } = require('../models');

const router = express.Router();

router.get('/token', (req, res) => {
    try {
        const user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        const access_token = jwt.sign({
            email: user.email,
            userId: user.userId,
        },
            process.env.JWT_SECRET_KEY,
            {
                expiresIn: '20m',
            });

        return res.status(200).json({
            access_token,
            success: true,
            message: 'refresh success',
        });
    } catch (err) {
        return res.status(401).json({
            refresh: true,
            success: false,
            message: 'refresh token is expired',
        });
    }
});

router.get('/user/nick', verifyToken, async (req, res) => {
    try {
        const { userId } = req.user;
        const { nick } = await User.findByPk(userId);

        return res.status(200).json({
            nick,
            success: true,
            message: 'refer success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/list/deal', verifyToken, async (req, res, next) => {
    try {
        const { page, pagesize, search, category } = req.query;
        const offset = Number(page) > 0 ? Number(pagesize) * Number(page) : 0;
        const limit = Number(page) > 0 ? Number(pagesize) : 20;
        const list = [];
        let posts;

        if (category && search) {
            posts = await DealPost.findAll({
                where: { title: { [Op.like]: `%${decodeURI(search)}%` }, content: { [Op.like]: `%${decodeURI(search)}%` }, category: { [Op.like]: `${decodeURI(category)}%` } },
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else if (search) {
            posts = await DealPost.findAll({
                where: { title: { [Op.like]: `%${decodeURI(search)}%` }, content: { [Op.like]: `%${decodeURI(search)}%` } },
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else if (category) {
            posts = await DealPost.findAll({
                where: { category: { [Op.like]: `${decodeURI(category)}%` } },
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else {
            posts = await DealPost.findAll({
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        }

        posts.forEach(post => {
            const { id, title, img, createdAt, price } = post;
            list.push({
                title,
                price,
                createdAt,
                postId: id,
                img: img.split('\n')[0],
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

router.get('/list/rent', verifyToken, async (req, res, next) => {
    try {
        const { page, pagesize, search, category } = req.query;
        const offset = Number(page) > 0 ? Number(pagesize) * Number(page) : 0;
        const limit = Number(page) > 0 ? Number(pagesize) : 20;
        const list = [];
        let posts;

        if (category && search) {
            posts = await RentPost.findAll({
                where: { title: { [Op.like]: `%${decodeURI(search)}%` }, content: { [Op.like]: `%${decodeURI(search)}%` }, category: { [Op.like]: `${decodeURI(category)}%` } },
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else if (search) {
            posts = await RentPost.findAll({
                where: { title: { [Op.like]: `%${decodeURI(search)}%` }, content: { [Op.like]: `%${decodeURI(search)}%` } },
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else if (category) {
            posts = await RentPost.findAll({
                where: { category: { [Op.like]: `${decodeURI(category)}%` } },
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else {
            posts = await RentPost.findAll({
                order: [['createdAt', 'DESC']],
                offset,
                limit,
            });
        }

        posts.forEach(post => {
            const { id, title, img, createdAt, price } = post;

            list.push({
                img,
                title,
                price,
                createdAt,
                postId: id,
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

router.get('/post', verifyToken, async (req, res, next) => {
    try {
        const { postId, type } = req.query;

        if (Number(type)) {
            const post = await RentPost.findByPk(postId);

            if (post) {
                const { userId } = req.user;
                const { id, img, title, content, createdAt, possible_time, price, category } = post;
                const { nick, rentLogs } = await User.findByPk(userId);
                const comments = await Comment.findAll({ where: { postId, type } });
                const isInterest = await Interest.findOne({ where: { userId, postId, type } });
                const updatedRentLogs = JSON.parse(rentLogs);

                updatedRentLogs.logs.unshift(id);
                updatedRentLogs.logs.pop();

                await User.update({ rentLogs: JSON.stringify(updatedRentLogs) }, { where: { id: userId } });

                return res.status(200).json({
                    id,
                    img,
                    title,
                    price,
                    content,
                    createdAt,
                    category,
                    author: nick,
                    possible_time: possible_time ? possible_time : '',
                    comments: comments.length,
                    interest: isInterest ? true : false,
                    isMe: post.userId === userId ? true : false,
                    success: true,
                    message: 'refer success',
                });
            } else {
                return res.status(410).json({
                    success: false,
                    message: 'non-existent post',
                });
            }
        } else {
            const post = await DealPost.findByPk(postId);

            if (post) {
                const { userId } = req.user;
                const { id, title, content, createdAt, price, category } = post;
                const { nick, dealLogs } = await User.findByPk(userId);
                const comments = await Comment.findAll({ where: { postId, type } });
                const isInterest = await Interest.findOne({ where: { userId, postId, type } });
                const updatedDealLogs = JSON.parse(dealLogs);
                const img = [];

                updatedDealLogs.logs.unshift(id);
                updatedDealLogs.logs.pop();

                await User.update({ dealLogs: JSON.stringify(updatedDealLogs) }, { where: { id: userId } });

                post.img.split('\n').forEach(url => {
                    if (url !== '') {
                        img.push(url);
                    }
                });

                return res.status(200).json({
                    id,
                    img,
                    title,
                    price,
                    content,
                    createdAt,
                    category,
                    author: nick,
                    comments: comments.length,
                    interest: isInterest ? true : false,
                    isMe: post.userId === userId ? true : false,
                    success: true,
                    message: 'refer success',
                });
            } else {
                return res.status(410).json({
                    success: false,
                    message: 'non-existent post',
                });
            }
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/comment', verifyToken, async (req, res, next) => {
    try {
        const { postId, type } = req.query;
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);

        if (isExist) {
            const { userId } = req.user;
            const comments = await Comment.findAll({ where: { postId, type }, order: [['createdAt', 'DESC']] });
            const list = [];

            for (const comment of comments) {
                const { content, createdAt } = comment;
                const { nick } = await User.findOne({ where: { id: comment.userId } });

                list.push({
                    nick,
                    content,
                    createdAt,
                    isMe: comment.userId === userId ? true : false,
                });
            }

            return res.status(200).json({
                list,
                success: true,
                message: 'refer success',
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

router.get('/list/interest', verifyToken, async (req, res, next) => {
    try {
        const { type } = req.query;
        const { userId } = req.user;
        const postIds = [];
        const list = [];
        const interests = await Interest.findAll({
            where: { userId, type },
            order: [['createdAt', 'DESC']],
        });

        if (Number(type)) {
            interests.forEach(interest => {
                postIds.push(interest.postId);
            });

            const posts = await RentPost.findAll({
                where: { id: { [Op.in]: postIds } },
                order: [['createdAt', 'DESC']],
            });

            posts.forEach(post => {
                const { id, img, title, createdAt, price } = post;

                list.push({
                    img,
                    title,
                    price,
                    createdAt,
                    postId: id,
                });
            });
        } else {
            interests.forEach(interest => {
                postIds.push(interest.postId);
            });

            const posts = await DealPost.findAll({
                where: { id: { [Op.in]: postIds } },
                order: [['createdAt', 'DESC']],
            });

            posts.forEach(post => {
                const { id, img, title, createdAt, price } = post;

                list.push({
                    title,
                    price,
                    createdAt,
                    postId: id,
                    img: img.split('\n')[0],
                });
            });
        }
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

router.get('/list/related', verifyToken, async (req, res, next) => {
    const { postId, type } = req.query;

    try {
        const list = [];

        if (Number(type)) {
            const { category } = await RentPost.findOne({ where: { id: postId } });
            const posts = await RentPost.findAll({
                where: { category, id: { [Op.ne]: postId } },
                order: sequelize.random(),
                limit: 6,
            });

            posts.forEach(post => {
                const { id, title, img } = post;

                list.push({
                    img,
                    title,
                    postId: id,
                });
            });
        } else {
            const { category } = await DealPost.findOne({ where: { id: postId } });
            const posts = await DealPost.findAll({
                where: { category, id: { [Op.ne]: postId } },
                order: sequelize.random(),
                limit: 6,
            });

            posts.forEach(post => {
                const { id, title, img } = post;

                list.push({
                    title,
                    postId: id,
                    img: img.split('\n')[0],
                });
            });
        }

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

/*router.get('/list/recommend', verifyToken, async (req, res, next) => {
    const { userId } = req.user;
    try {
        const posts = await axios.get('http://18.223.169.217/recommend', {
            params: {
                userId,
                type: 0,
            }
        });
        const list = [];
        console.log(posts);
        for (const postId of posts.data.list) {
            if (Number(postId) !== 0) {
                const { id, title, img } = await DealPost.findByPk(postId);

                list.push({
                    postId: id,
                    title,
                    img,
                });
            }
        }

        return res.status(200).json({
            list,
            success: true,
            message: 'refer success',
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});*/

router.get('/user/list/deal', verifyToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const posts = await DealPost.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
        const list = [];

        posts.forEach(post => {
            const { id, img, title, createdAt, price } = post;

            list.push({
                title,
                price,
                createdAt,
                postId: id,
                img: img.split('\n')[0],
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

router.get('/user/list/rent', verifyToken, async (req, res, next) => {
    try {
        const { userId } = req.user;
        const posts = await RentPost.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
        const list = [];

        posts.forEach(post => {
            const { id, img, title, createdAt, price } = post;

            list.push({
                img,
                title,
                price,
                createdAt,
                postId: id,
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

router.get('/deal/img', verifyToken, async (req, res, next) => {
    try {
        const { postId } = req.query;
        const { img } = await DealPost.findByPk(postId);

        if (img) {
            const list = [];

            img.split('\n').forEach(url => {
                if (url !== '') {
                    list.push(url);
                }
            });

            return res.status(200).json({
                list,
                success: true,
                message: 'refer success',
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

router.get('/rent/img', verifyToken, async (req, res, next) => {
    try {
        const { postId } = req.query;
        const { img } = await RentPost.findByPk(postId);

        if (img) {
            return res.status(200).json({
                img,
                success: true,
                message: 'refer success',
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

router.get('/category', verifyToken, (req, res) => {
    return res.status(200).json({
        category: [
            {
                "parent": "도서",
                "body": [
                    "프로그래밍",
                    "소설",
                    "자기계발서",
                    "기타"
                ]
            },
            {
                "parent": "전자기기",
                "body": [
                    "핸드폰",
                    "PC 주변기기",
                    "음향기기",
                    "저장기기",
                    "기타"
                ]
            },
            {
                "parent": "운동기구",
                "body": [
                    "스포츠",
                    "헬스",
                    "기타"
                ]
            },
            {
                "parent": "식품",
                "body": [
                    "과자",
                    "음료",
                    "가공식품",
                    "기타"
                ]
            },
            {
                "parent": "생필품",
                "body": [
                    "세면도구",
                    "청소도구",
                    "세탁/청소용품",
                    "방향/탈취용품",
                    "기타"
                ]
            },
            {
                "parent": "의류",
                "body": [
                    "남성의류",
                    "여성의류",
                    "신발",
                    "기타"
                ]
            },
            {
                "parent": "기타",
                "body": ["기타"]
            }
        ],
        success: true,
        message: 'refer success',
    });
});

module.exports = router;