const express = require('express');
const {verifyToken} = require('./middlewares');

const router = express.Router();

router.get('/nick', verifyToken, (req, res) => {
    return res.status(200).json({
        nick : req.app.get('user').nick,
    });
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