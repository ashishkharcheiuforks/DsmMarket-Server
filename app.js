const morgan = require('morgan');
const {sequelize} = require('./models');
const express = require('express');
const passport = require('passport');
const http = require('http');
const {ChatLog} = require('./models');

const testRouter = require('./routes/test');
const accountRouter = require('./routes/account');
const authRouter = require('./routes/auth');
const getRouter = require('./routes/get');
const postRouter = require('./routes/post');
const reportRouter = require('./routes/report');
const roomRouter = require('./routes/room');
const passportConfig = require('./passport');
const cors = require('cors');

const app = express();
sequelize.sync();
passportConfig(passport);

app.set('port', process.env.PORT | 8001);

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended : false}));

app.use('/test', testRouter);
app.use('/account', accountRouter);
app.use('/auth', authRouter);
app.use('/', getRouter);
app.use('/post', postRouter);
app.use('/report', reportRouter);
app.use('/room', roomRouter);

app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500).send(err);
});

const server = http.createServer(app).listen(app.get('port'), () => {
    console.log('server is running on', app.get('port'));
});

const io = require('socket.io').listen(server);

io.sockets.on('connection', (socket) => {
    socket.on('joinRoom', (data) => {
        socket.join(data.room);
        socket.email = data.email;
        socket.room = data.room;
    });

    socket.on('sendMessage', async (data) => {
        await ChatLog.create({
            message : data.msg,
            email : socket.email,
            roomId : socket.room,
        });
        socket.broadcast.to(socket.room).emit('broadcastMessage', data);
    });
});