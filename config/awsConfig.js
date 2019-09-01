require('dotenv').config();

module.exports = {
    aws_access_key_id : process.env.AWS_ACCESS_KEY,
    aws_secret_access_key : process.env.AWS_SECRET_KEY,
    region : 'ap-northeast-2'
};