require('dotenv').config();

module.exports = {
    development : {
        username : 'root',
        password : process.env.MYSQL_DEVELOPMENT_PASSWORD,
        database : 'dsm_market',
        host : '127.0.0.1',
        dialect : 'mysql',
        logging : false,
    },
};