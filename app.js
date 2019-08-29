const morgan = require('morgan');
const {sequelize} = require('./models');
const path = require('path');
const express = require('express');
const passport = require('passport');
require('dotenv').config();

const authRouter = require('./routes/auth');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('port', process.env.PORT | 8001);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use('/account/auth', authRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    res.status(404).json({
        message : err,
    });
});

app.listen(app.get('port'), () => {
    console.log('server is running on', app.get('port'));
});