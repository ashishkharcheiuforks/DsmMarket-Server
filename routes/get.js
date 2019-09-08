const express = require('express');
const {verifyToken} = require('./middlewares');
const {DealPost, RentPost} = require('../models');

const router = express.Router();
const referTable = {};

router.post('/token', (req, res, next) => {
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
        })
    }
});
router.get('/user', verifyToken, (req, res) => {
    return res.status(200).json({
        nick : req.app.get('user').nick,
    });
});
router.get('/list/deal', verifyToken, async (req, res, next) => {
    const user = req.app.get('user').nick;
    const page = Number(req.query.page);
    const pagesize = Number(req.query.pagesize);
    const search = req.query.search;
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
        const posts = await DealPost.findAll({
            offset : referTable[user].offset,
            limit : referTable[user].limit,
            order : [['createdAt', 'DESC']],
        });
        const list = [];
        if (search) {
            posts.forEach(post => {
                if (post.title.match(decodeURI(search))) {
                    list.push({
                        postId : post.id,
                        title : post.title,
                        img : post.img,
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
                    img : post.img,
                    createdAt : post.createdAt.toString(),
                    price : post.price,
                });
            });
        }
        return res.status(200).json({
            list,
            message : 9,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.get('/list/rent', verifyToken, async (req, res, next) => {
    const user = req.app.get('user').nick;
    const page = Number(req.query.page);
    const pagesize = Number(req.query.pagesize);
    const search = req.query.search;
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
        const posts = await RentPost.findAll({
            offset : referTable[user].offset,
            limit : referTable[user].limit,
            order : [['createdAt', 'DESC']],
        });
        const list = [];
        if (search) {
            posts.forEach(post => {
                const flag = Number(post.price.split('/')[0]);
                const price = post.price.split('/')[1];
                if (post.title.match(decodeURI(search))) {
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
        return res.status(200).json({
            list,
            message : 9,
        });
    } catch (err) {
        console.error(err);
        next(err);
    }
});
router.get('/post', verifyToken, async (req, res, next) => {
    const {id, type} = req.body;
    const userId = req.app.get('user').userId;
    try {
        if (Number(type)) {
            const {img, postId, title, content, createdAt, price} = await DealPost.findOne({
                where : {id},
            })
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
        ]
    });
});
module.exports = router;