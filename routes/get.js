const express = require('express');
const jwt = require('jsonwebtoken');
const {verifyToken} = require('./middlewares');
const axios = require('axios');
const {User, DealPost, RentPost, Comment, Interest, sequelize, Sequelize : {Op}} = require('../models');

const router = express.Router();

router.get('/token', (req, res) => {
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
            success : true,
            message : 'refresh success',
        });
    } catch (err) {
        return res.status(401).json({
            refresh : true,
            success : false,
            message : 'refresh token is expired',
        });
    }
});

router.get('/user/nick', verifyToken, async (req, res) => {
    try {
        const {userId} = req.user;
        const {nick} = await User.findByPk(userId);
        return res.status(200).json({
            nick,
        });
    } catch (err) {
        console.error(err);
        return next(err);
    }
});

router.get('/list/deal', verifyToken, async (req, res, next) => {
    try {
        const {page, pagesize, search, category} = req.query;
        const offset = Number(page) > 0 ? Number(pagesize) * Number(page) : 0;
        const limit = Number(page) > 0 ? Number(pagesize) : 20;
        const list = [];
        let posts;

        if (category && search) {
            posts = await DealPost.findAll({
                where : {title : {[Op.like] : `%${decodeURI(search)}%`}, content : {[Op.like] : `%${decodeURI(search)}%`}, category : {[Op.like] : `${decodeURI(category)}%`}},
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
            console.log('1');
        } else if (search) {
            posts = await DealPost.findAll({
                where : {title : {[Op.like] : `%${decodeURI(search)}%`}, content : {[Op.like] : `%${decodeURI(search)}%`}},
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
            console.log('2');
        } else if (category) {
            posts = await DealPost.findAll({
                where : {category : {[Op.like] : `${decodeURI(category)}%`}},
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
            console.log('3');
        } else {
            posts = await DealPost.findAll({
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
            console.log('4');
            console.log(offset, limit);
        }

        posts.forEach(post => {
            const {id, title, img, createdAt, price} = post;
            list.push({
                title,
                createdAt,
                postId : id,
                img : img.split('\n')[0],
                price : `${price.toLocaleString()}원`,
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

router.get('/list/rent', verifyToken, async (req, res, next) => {
    try {
        const {page, pagesize, search, category} = req.query;
        const offset = Number(page) > 0 ? Number(pagesize) * Number(page) : 0;
        const limit = Number(page) > 0 ? Number(pagesize) : 20;
        const list = [];
        let posts;

        if (category && search) {
            posts = await RentPost.findAll({
                where : {title : {[Op.like] : `%${decodeURI(search)}%`}, content : {[Op.like] : `%${decodeURI(search)}%`}, category : {[Op.like] : `${decodeURI(category)}%`}},
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else if (search) {
            posts = await RentPost.findAll({
                where : {title : {[Op.like] : `%${decodeURI(search)}%`}, content : {[Op.like] : `%${decodeURI(search)}%`}},
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else if (category) {
            posts = await RentPost.findAll({
                where : {category : {[Op.like] : `${decodeURI(category)}%`}},
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
        } else {
            posts = await RentPost.findAll({
                order : [['createdAt', 'DESC']],
                offset,
                limit,
            });
        }

        posts.forEach(post => {
            const {id, title, img, createdAt, price} = post;
            const flag = Number(price.split('/')[0]);
            list.push({
                title,
                img,
                createdAt,
                postId : id,
                price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
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

router.get('/post', verifyToken, async (req, res, next) => {
    try {
        const {postId, type} = req.query;

        if (Number(type)) {
            const post = await RentPost.findByPk(postId);
            console.log(post);

            if (post) {
                const {userId} = req.user;
                const {id, img, author, title, content, createdAt, possible_time, price, category} = post;
                const user = await User.findByPk(userId);
                const comments = await Comment.findAll({
                    where : {rentPostId : postId},
                });
                const isInterest = await Interest.findOne({
                    where : {userId, postId},
                });
                const flag = Number(price.split('/')[0]);
                const rentLogs = JSON.parse(user.rentLogs);
                
                rentLogs.logs.unshift(Number(postId));
                rentLogs.logs.pop();

                await User.update({
                    rentLogs : JSON.stringify(rentLogs),
                }, {
                    where : {id : userId},
                });

                return res.status(200).json({
                    id,
                    img,
                    author,
                    title,
                    content,
                    createdAt,
                    category,
                    price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                    possible_time : possible_time ? possible_time : '',
                    comments : comments.length,
                    interest : isInterest ? true : false,
                    isMe : post.userId === userId ? true : false,
                    success : true,
                    message : 'refer success',
                });
            } else {
                return res.status(410).json({
                    success : false,
                    message : 'non-existent post',
                });
            }
        } else {
            const post = await RentPost.findByPk(postId);

            if (post) {
                const {userId} = req.user;
                const {id, img, author, title, content, createdAt, price, category} = post;
                const user = await User.findByPk(userId);
                const comments = await Comment.findAll({
                    where : {rentPostId : postId},
                });
                const isInterest = await Interest.findOne({
                    where : {userId, postId},
                });
                const dealLogs = JSON.parse(user.daelLogs);
                
                daelLogs.logs.unshift(Number(postId));
                dealLogs.logs.pop();

                await User.update({
                    rentLogs : JSON.stringify(dealLogs),
                }, {
                    where : {id : userId},
                });

                return res.status(200).json({
                    id,
                    img,
                    author,
                    title,
                    content,
                    createdAt,
                    category,
                    price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
                    comments : comments.length,
                    interest : isInterest ? true : false,
                    isMe : post.userId === userId ? true : false,
                    success : true,
                    message : 'refer success',
                });
            } else {
                return res.status(410).json({
                    success : false,
                    message : 'non-existent post',
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
        const {postId, type} = req.query;
        const isExist = Number(type) ? await RentPost.findByPk(postId) : await DealPost.findByPk(postId);
        
        if (isExist) {
            if (Number(type)) {
                const comments = await Comment.findAll({
                    where : {rentPostId : postId},
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
                    success : true,
                    message : 'refer success',
                });
            } else {
                const comments = await Comment.findAll({
                    where : {dealPostId : postId},
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
                    success : true,
                    message : 'refer success',
                });
            }
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

router.get('/list/interest', verifyToken, async (req, res, next) => {
    try {
        const {type} = req.query;
        const {userId} = req.user;
        const postIds = [];
        const list = [];
        const interests = await Interest.findAll({
            where : {userId, type},
            order : [['createdAt', 'DESC']],
        });

        if (Number(type)) {
            interests.forEach(interest => {
                postIds.push(interest.postId);
            });

            const posts = await RentPost.findAll({
                where : {id : {[Op.in] : postIds}},
                order : [['createdAt', 'DESC']],
            });

            posts.forEach(post => {
                const {id, img, title, createdAt, price} = post;
                const flag = Number(price.split('/')[0]);

                list.push({
                    img,
                    title,
                    createdAt,
                    postId : id,
                    price : flag ? `1시간 당 ${post.price.split('/')[1]}원` : `1회 당 ${post.price.split('/')[1]}원`,
                });
            });
        } else {
            interests.forEach(interest => {
                postIds.push(interest.postId);
            });

            const posts = await DealPost.findAll({
                where : {id : {[Op.in] : postIds}},
                order : [['createdAt', 'DESC']],
            });

            posts.forEach(post => {
                const {id, img, title, createdAt, price} = post;

                list.push({
                    img,
                    title,
                    createdAt,
                    postId : id,
                    price : `${price}원`,
                });
            });
        }
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

router.get('/list/related', verifyToken, async (req, res, next) => {
    const {postId, type} = req.query;
    try {
        const list = [];
        if (Number(type)) {
            const {category} = await RentPost.findOne({
                where : {id : Number(postId)},
            });
            const posts = await RentPost.findAll({
                where : {category, id : {[Op.ne] : Number(postId)}},
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
            const {category} = await DealPost.findOne({
                where : {id : Number(postId)},
            });
            const posts = await DealPost.findAll({
                where : {category, id : {[Op.ne] : Number(postId)}},
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
    const {userId} = req.user;
    try {
        const posts = await axios.get('http://18.223.169.217/recommend', {
            params : {
                userId,
                type : 0,
            }
        });
        const list = [];
        for (const postId of posts.data.list) {
            if (Number(postId) !== 0) {
                const post = await DealPost.findOne({
                    where : {id : Number(postId)},
                });
                
                if (post) {
                    const {id, title, img} = post;
                    list.push({
                        postId : id,
                        title,
                        img,
                    });
                }
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
router.get('/user/list/deal', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.user;
        const posts = await DealPost.findAll({
            where : {userId},
            order : [['createdAt', 'DESC']],
        });
        const list = [];

        posts.forEach(post => {
            const {id, img, title, createdAt, price} = post;
            list.push({
                title,
                createdAt,
                postId : id,
                img : img.split('\n')[0],
                price : `${price}원`,
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

router.get('/user/list/rent', verifyToken, async (req, res, next) => {
    try {
        const {userId} = req.user;
        const posts = await RentPost.findAll({
            where : {userId},
            order : [['createdAt', 'DESC']],
        });
        const list = [];

        posts.forEach(post => {
            const {id, img, title, createdAt, price} = post;
            const flag = Number(post.price.split('/')[0]);
            list.push({
                postId : id,
                img : img,
                title : title,
                createdAt : createdAt,
                price : flag ? `1시간 당 ${price}원` : `1회 당 ${price}원`,
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
