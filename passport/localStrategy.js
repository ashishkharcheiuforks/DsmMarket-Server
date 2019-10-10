const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const {User} = require('../models');

module.exports = (passport) => {
    passport.use(new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
    }, async (email, password, done) => {
        try {
            const exUser = await User.findOne({
                where : {email},
            });
            if (exUser) {
                const result1 = await bcrypt.compare(password, exUser.password);
                if (exUser.tempPassword) {
                    const result2 = await bcrypt.compare(password, exUser.tempPassword);
                    if (result1 | result2) {
                        done(null, exUser);
                    } else {
                        done(null, false);
                    }
                } else {
                    if (result1) {
                        done(null, exUser);
                    } else {
                        done(null, false);
                    }
                }
            } else {
                done(null, false);
            }
        } catch (error) {
            console.error(error);
            done(error);
        }
    }));
};