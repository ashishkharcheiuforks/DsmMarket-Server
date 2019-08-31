const express = require('express');
const bcrypt = require('bcrypt');
const {verifyToken} = require('./middlewares');
const {User} = require('../models');

const router = express.Router();

router.patch('/password', verifyToken, async (req, res, next) => {
    const email = req.app.get('user').email;
    const password = await bcrypt.hash(req.body.password, 12);
    try {
        await User.update({
            password,
        }, {
            where : {email},
        });
        return res.status(200).json({
            message : 2,
        })
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
router.patch('/nick', verifyToken, async (req, res, next) => {
    const nick = req.app.get('user').nick;
    const new_nick = req.body.nick;
    try {
        const exNick = await User.findOne({where : {nick : new_nick}});
        if (exNick) {
            return res.status(403).json({
                errorCode : 1,
            });
        } else {
            await User.update({
                nick : new_nick,
            }, {
                where : {nick},
            });
            return res.status(200).json({
                message : 2,
            });
        }
    } catch (err) {
        console.error(err);
        return next(err);
    }
});
module.exports = router;