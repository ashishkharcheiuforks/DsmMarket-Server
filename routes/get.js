const express = require('express');
const jwt = require('jsonwebtoken');
const {verifyToken} = require('./middlewares');
const axios = require('axios');
const {User, DealPost, RentPost, Comment, Interest, sequelize, Sequelize : {Op}} = require('../models');

const router = express.Router();
const referTable = {};

router.get('/token', (req, res, next) => {
    try {
        const user = jwt.verify(req.headers.authorization, process.env.JWT_SECRET_KEY);
        const access_token = jwt.sign({
            email : user.email,
            userId : user.userId,
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
router.get('/user/nick', verifyToken, async (req, res) => {
    try {
        const {email} = req.app.get('user');
        const {nick} = await User.findOne({
            where : {email},
        });
        return res.status(200).json({
            nick,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.get('/list/deal', verifyToken, async (req, res, next) => {
    const email = req.app.get('user').email;
    const page = Number(req.query.page);
    const pagesize = Number(req.query.pagesize);
    const search = req.query.search ? decodeURI(req.query.search) : false;
    const category = req.query.category ? decodeURI(req.query.category) : false;
    try {
        if (referTable.hasOwnProperty(email)) {
            if (referTable[email].count >= page) {
                referTable[email].count = page;
                referTable[email].limit = pagesize;
                referTable[email].offset = 0;
            } else {
                referTable[email].count = page;
                referTable[email].limit = pagesize;
                referTable[email].offset += pagesize;
            }
        } else {
            referTable[email] = {
                count : page,
                limit : pagesize,
                offset : 0
            };    
        }
        const list = [];
        if (category) {
            const posts = await DealPost.findAll({
                where : {category : {[Op.like] : `${category}%`}},
                offset : referTable[email].offset,
                limit : referTable[email].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    if (post.title.match(search) || post.content.match(search)) {
                        list.push({
                            postId : post.id,
                            title : post.title,
                            img : post.img.split('\n')[0],
                            createdAt : post.createdAt.toString(),
                            price : `${post.price}원`,
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
                        price : `${post.price}원`,
                    });
                });
            }
        } else {
            const posts = await DealPost.findAll({
                offset : referTable[email].offset,
                limit : referTable[email].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    if (post.title.match(search) || post.content.match(search)) {
                        list.push({
                            postId : post.id,
                            title : post.title,
                            img : post.img.split('\n')[0],
                            createdAt : post.createdAt.toString(),
                            price : `${post.price}원`,
                        });
                    }
                });
            } else {
                posts.forEach(post => {
                    list.push({
                        postId : post.id,
                        title : post.title,
                        img : post.img.split('\n')[0],
                        createdAt : post.createdAt,
                        price : `${post.price}원`,
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
    const email = req.app.get('user').email;
    const page = Number(req.query.page);
    const pagesize = Number(req.query.pagesize);
    const search = req.query.search ? decodeURI(req.query.search) : false;
    const category = req.query.category ? decodeURI(req.query.category) : false;
    try {
        if (referTable.hasOwnProperty(email)) {
            if (referTable[email].count >= page) {
                referTable[email].count = page;
                referTable[email].limit = pagesize;
                referTable[email].offset = 0;
            } else {
                referTable[email].count = page;
                referTable[email].limit = pagesize;
                referTable[email].offset += pagesize;
            }
        } else {
            referTable[email] = {
                count : page,
                limit : pagesize,
                offset : 0
            };    
        }
        const list = [];
        if (category) {
            const posts = await RentPost.findAll({
                where : {category : {[Op.like] : `${category}%`}},
                offset : referTable[email].offset,
                limit : referTable[email].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    const flag = Number(post.price.split('/')[0]);
                    const price = Number(post.price.split('/')[1]).toLocaleString();
                    if (post.title.match(search) || post.content.match(search)) {
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
                    const price = Number(post.price.split('/')[1]).toLocaleString();
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
                offset : referTable[email].offset,
                limit : referTable[email].limit,
                order : [['createdAt', 'DESC']],
            });
            if (search) {
                posts.forEach(post => {
                    const flag = Number(post.price.split('/')[0]);
                    const price = Number(post.price.split('/')[1]).toLocaleString();
                    if (post.title.match(search) || post.content.match(search)) {
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
                    const price = Number(post.price.split('/')[1]).toLocaleString();
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
                const flag = Number(post.price.split('/')[0]);
                const price = post.price.split('/')[1];
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
                    price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                    possible_time : post.possible_time ? post.possible_time : '',
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
                    price : `${post.price}원`,
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
                    img : post.img.split('\n')[0],
                    title : post.title,
                    createdAt : post.createdAt,
                    price : `${post.price}원`,
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
                where : {id : postId},
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
    const {postId, type} = req.query;
    const userId = req.app.get('user').userId;
    try {
        const posts = await axios.get('https://b2cf3f8e-7ec8-4310-9951-29b5c96679c6.mock.pstmn.io/list/recommend', {
            params : {
                userId,
                type,
            }
        });
        const list = [];
        console.log(posts);

        for (const post of posts.list) {
            const {id, title, img} = type ? await RentPost.findOne({
                where : {id : post.id}
            }) : await DealPost.findOne({
                where : {id : post.id}
            });

            list.push({
                postId : id,
                type,
                title,
                img,
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
                postId : post.id,
                img : post.img.split('\n')[0],
                title : post.title,
                createdAt : post.createdAt,
                price : `${post.price}원`,
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
            const price = Number(post.price.split('/')[1]).toLocaleString();
            list.push({
                postId : post.id,
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
router.get('/deal/img', verifyToken, async (req, res, next) => {
    const id = req.query.postId;
    try {
        const {img} = await DealPost.findOne({
            where : {id},
        });
        if (img) {
            const list = [];
            img.split('\n').forEach(url => {
                if (url !== '') {
                    list.push(url);
                }
            });
            return res.status(200).json({
                list,
                message : 9,
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
router.get('/rent/img', verifyToken, async (req, res, next) => {
    const id = req.query.postId;
    try {
        const {img} = await RentPost.findOne({
            where : {id},
        });
        if (img) {
            return res.status(200).json({
                img,
                message : 9,
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
    });
});
module.exports = router;