const express = require('express');
const jwt = require('jsonwebtoken');
const {verifyToken} = require('./middlewares');
const axios = require('axios');
const {DealPost, RentPost, Comment, Interest, sequelize, Sequelize : {Op}} = require('../models');

const router = express.Router();
const referTable = {};

router.get('/token', (req, res, next) => {
    try {
        const user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        const access_token = jwt.sign({
            email : user.email,
            nick : user.nick,
            userId : user.id,
        },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn : '5m',
        });
        return res.status(200).json({
            access_token,
            message : 5,
        });
    } catch (err) {
        return res.status(401).json({
            errorCode : 4,
        });
    }
});
router.get('/user/nick', verifyToken, (req, res) => {
    return res.status(200).json({
        nick : req.app.get('user').nick,
    });
});
router.get('/list/deal', verifyToken, async (req, res, next) => {
    const user = req.app.get('user').nick;
    const page = Number(req.query.page);
    const pagesize = Number(req.query.pagesize);
    const {search, category} = req.query;
    try {
        if (referTable.hasOwnProperty(user)) {
            if (referTable[user].count >= page) {
                referTable[user].count = page;
                referTable[user].limit = pagesize;
                referTable[user].offset = 0;
            } else {
                referTable[user].count = page;
                referTable[user].limit = pagesize;
                referTable[user].offset += pagesize;
            }
        } else {
            referTable[user] = {
                count : page,
                limit : pagesize,
                offset : 0
            };    
        }
        const list = [];
        if (category) {
            const posts = await DealPost.findAll({
                where : {category},
                offset : referTable[user].offset,
                limit : referTable[user].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    if (post.title.match(decodeURI(search)) || post.content.match(decodeURI(search))) {
                        list.push({
                            postId : post.id,
                            title : post.title,
                            img : post.img.split('\n')[0],
                            createdAt : post.createdAt.toString(),
                            price : post.price,
                        });
                    }
                });
            } else {
                posts.forEach(post => {
                    list.push({
                        postId : post.id,
                        title : post.title,
                        img : post.img.split('\n')[0],
                        createdAt : post.createdAt.toString(),
                        price : post.price,
                    });
                });
            }
        } else {
            const posts = await DealPost.findAll({
                offset : referTable[user].offset,
                limit : referTable[user].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    if (post.title.match(decodeURI(search)) || post.content.match(decodeURI(search))) {
                        list.push({
                            postId : post.id,
                            title : post.title,
                            img : post.img.split('\n')[0],
                            createdAt : post.createdAt.toString(),
                            price : post.price,
                        });
                    }
                });
            } else {
                posts.forEach(post => {
                    list.push({
                        postId : post.id,
                        title : post.title,
                        img : post.img.split('\n')[0],
                        createdAt : post.createdAt.toString(),
                        price : post.price,
                    });
                });
            }
        }
        return res.status(200).json({
            list,
            message : 9,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/list/rent', verifyToken, async (req, res, next) => {
    const user = req.app.get('user').nick;
    const page = Number(req.query.page);
    const pagesize = Number(req.query.pagesize);
    const {search, category} = req.query;
    try {
        if (referTable.hasOwnProperty(user)) {
            if (referTable[user].count >= page) {
                referTable[user].count = page;
                referTable[user].limit = pagesize;
                referTable[user].offset = 0;
            } else {
                referTable[user].count = page;
                referTable[user].limit = pagesize;
                referTable[user].offset += pagesize;
            }
        } else {
            referTable[user] = {
                count : page,
                limit : pagesize,
                offset : 0
            };    
        }
        const list = [];
        if (category) {
            const posts = await RentPost.findAll({
                where : {category},
                offset : referTable[user].offset,
                limit : referTable[user].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    const flag = Number(post.price.split('/')[0]);
                    const price = post.price.split('/')[1];
                    if (post.title.match(decodeURI(search)) || post.content.match(decodeURI(search))) {
                        list.push({
                            postId : post.id,
                            title : post.title,
                            img : post.img,
                            createdAt : post.createdAt,
                            price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                        });
                    }
                });
            } else {
                posts.forEach(post => {
                    const flag = Number(post.price.split('/')[0]);
                    const price = post.price.split('/')[1];
                    list.push({
                        postId : post.id,
                        title : post.title,
                        img : post.img,
                        createdAt : post.createdAt,
                        price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                    });
                });
            }
        } else {
            const posts = await RentPost.findAll({
                offset : referTable[user].offset,
                limit : referTable[user].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    const flag = Number(post.price.split('/')[0]);
                    const price = post.price.split('/')[1];
                    if (post.title.match(decodeURI(search)) || post.content.match(decodeURI(search))) {
                        list.push({
                            postId : post.id,
                            title : post.title,
                            img : post.img,
                            createdAt : post.createdAt,
                            price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                        });
                    }
                });
            } else {
                posts.forEach(post => {
                    const flag = Number(post.price.split('/')[0]);
                    const price = post.price.split('/')[1];
                    list.push({
                        postId : post.id,
                        title : post.title,
                        img : post.img,
                        createdAt : post.createdAt,
                        price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                    });
                });
            }
        }
        return res.status(200).json({
            list,
            message : 9,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/post', verifyToken, async (req, res, next) => {
    const userId = req.app.get('user').userId;
    const {postId, type} = req.query;
    try {
        if (Number(type)) {
            const post = await RentPost.findOne({
                where : {id : postId},
            });
            if (post) {
                const comments = await Comment.findAll({
                    where : {rentPostId : postId},
                });
                const isInterest = await Interest.findOne({
                    where : {userId, postId},
                });
                return res.status(200).json({
                    img : post.img,
                    id : post.id,
                    author : post.author,
                    title : post.title,
                    content : post.content,
                    createdAt : post.createdAt,
                    price : post.price,
                    possible_time : post.possible_time,
                    comments : comments.length,
                    interest : isInterest ? true : false,
                    category : post.category,
                    message : 9,
                });
            } else {
                return res.status(410).json({
                    errorCode : 11,
                });
            }
        } else {
            const post = await DealPost.findOne({
                where : {id : postId},
            });
            if (post) {
                const comments = await Comment.findAll({
                    where : {dealPostId : postId},
                });
                const isInterest = await Interest.findOne({
                    where : {userId, postId},
                });
                const urls = [];
                post.img.split('\n').forEach(url => {
                    if (url !== '') {
                        urls.push(url);
                    }
                });
                return res.status(200).json({
                    img : urls,
                    id : post.id,
                    author : post.author,
                    title : post.title,
                    content : post.content,
                    createdAt : post.createdAt,
                    price : post.price,
                    comments : comments.length,
                    interest : isInterest ? true : false,
                    category : post.category,
                    message : 9,
                });
            } else {
                return res.status(410).json({
                    errorCode : 11,
                });
            }
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/comment', verifyToken, async (req, res, next) => {
    const {postId, type} = req.query;
    try {
        const isExist = Number(type) ? await RentPost.findOne({
            where : {id : postId},
        }) : await DealPost.findOne({
            where : {id : postId},
        });
        if (isExist) {
            if (Number(type)) {
                const comments = await Comment.findAll({
                    where : {rentPostId : postId},
                    attributes : ['nick', 'content', 'createdAt'],
                    order : [['createdAt', 'DESC']],
                });
                const list = [];
                comments.forEach(comment => {
                    const {nick, content, createdAt} = comment;
                    list.push({
                        nick,
                        content,
                        createdAt,
                    });
                });
                return res.status(200).json({
                    list,
                    message : 9,
                });
            } else {
                const comments = await Comment.findAll({
                    where : {dealPostId : postId},
                    attributes : ['nick', 'content', 'createdAt'],
                    order : [['createdAt', 'DESC']],
                });
                const list = [];
                comments.forEach(comment => {
                    const {nick, content, createdAt} = comment;
                    list.push({
                        nick,
                        content,
                        createdAt,
                    });
                });
                return res.status(200).json({
                    list,
                    message : 9,
                });
            }
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
router.get('/list/interest', verifyToken, async (req, res, next) => {
    const type = req.query.type;
    const userId = req.app.get('user').userId;
    try {
        if (Number(type)) {
            const rentPosts = await Interest.findAll({
                where : {userId, type},
                attributes : ['postId'],
                order : [['createdAt', 'DESC']],
            });
            const postIds = [];
            rentPosts.forEach(rentPost => {
                postIds.push(rentPost.postId);
            });
            const posts = await RentPost.findAll({
                where : {id : {[Op.in] : postIds}},
                order : [['createdAt', 'DESC']],
            });
            const list = [];
            posts.forEach(post => {
                const flag = Number(post.price.split('/')[0]);
                list.push({
                    postId : post.id,
                    img : post.img,
                    title : post.title,
                    createdAt : post.createdAt,
                    price : flag ? `1시간 당 ${post.price.split('/')[1]}원` : `1회 당 ${post.price.split('/')[1]}원`,
                });
            });
            return res.status(200).json({
                list,
                message : 9,
            });
        } else {
            const dealPosts = await Interest.findAll({
                where : {userId, type},
                attributes : ['postId'],
                order : [['createdAt', 'DESC']],
            });
            const postIds = [];
            dealPosts.forEach(dealPost => {
                postIds.push(dealPost.postId);
            });
            const posts = await DealPost.findAll({
                where : {id : {[Op.in] : postIds}},
                order : [['createdAt', 'DESC']],
            });
            const list = [];
            posts.forEach(post => {
                list.push({
                    postId : post.id,
                    img : post.img,
                    title : post.title,
                    createdAt : post.createdAt,
                    price : post.price,
                });
            });
            return res.status(200).json({
                list,
                message : 9,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/list/related', verifyToken, async (req, res, next) => {
    const {postId, type} = req.query;
    try {
        const list = [];
        if (Number(type)) {
            const posts = await RentPost.findAll({
                where : {id : postId},
                order : sequelize.random(),
                limit : 6,
            });
            posts.forEach(post => {
                list.push({
                    postId : post.id,
                    title : post.title,
                    img : post.img,
                });
            });
        } else {
            const posts = await DealPost.findAll({
                where : {category},
                order : sequelize.random(),
                limit : 6,
            });
            posts.forEach(post => {
                list.push({
                    postId : post.id,
                    title : post.title,
                    img : post.img.split('\n')[0],
                });
            });
        }
        return res.status(200).json({
            list,
            message : 9,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/list/recommend', verifyToken, async (req, res, next) => {
    const category = req.query.category;
    try {
        const res = await axios.get('/get_log', {

        });
        const list = [];
        
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/user/list/deal', verifyToken, async (req, res, next) => {
    const userId = req.app.get('user').userId;
    try {
        const posts = await DealPost.findAll({
            where : {userId},
            order : [['createdAt', 'DESC']],
        });
        const list = [];
        posts.forEach(post => {
            list.push({
                postId,
                img : post.img.split('/')[0],
                title : post.title,
                createdAt : post.createdAt,
                price : post.price,
            });
        });
        return res.status(200).json({
            list,
            message : 9,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/user/list/rent', verifyToken, async (req, res, next) => {
    const userId = req.app.get('user').userId;
    try {
        const posts = await RentPost.findAll({
            where : {userId},
            order : [['createdAt', 'DESC']],
        });
        const list = [];
        posts.forEach(post => {
            const flag = Number(post.price.split('/')[0]);
            list.push({
                postId,
                img : post.img,
                title : post.title,
                createdAt : post.createdAt,
                price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
            });
        });
        return res.status(200).json({
            list,
            message : 9,
        });
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
                    "기"
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
    });
});
module.exports = router;