const AWS = require('aws-sdk');
const path = require('path');
AWS.config.loadFromPath(path.join(__dirname, '/awsConfig.json'));
const S3 = new AWS.S3();
const multer = require('multer');
const multerS3 = require('multer-s3');

exports.upload = multer({
    storage: multerS3({
        s3: S3,
        bucket: "dsmmarket",
        key: (req, file, cb) => {
            const name = new Date().valueOf() + path.extname(file.originalname);
            cb(null, name);
        },
        acl: 'public-read-write',
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
});

exports.deleteFile = async (params) => {
    try {
        await S3.deleteObject(params).promise();
    } catch (err) {
        console.error(err);
    }
};