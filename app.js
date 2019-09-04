const morgan = require('morgan');
const {sequelize} = require('./models');
const path = require('path');
const express = require('express');
const passport = require('passport');
require('dotenv').config();

const authRouter = require('./routes/auth');
const editRouter = require('./routes/edit');
const mailRouter = require('./routes/mail');
const getRouter = require('./routes/get');
const postRouter = require('./routes/post');
const passportConfig = require('./passport');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('port', process.env.PORT | 8001);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use('/account/auth', authRouter);
app.use('/account/edit', editRouter);
app.use('/get', getRouter);
app.use('/post', postRouter);
app.use('/mail', mailRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err);
});

app.listen(app.get('port'), () => {
    console.log('server is running on', app.get('port'));
});