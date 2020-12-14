const path = require('path')
module.exports = {
    HOSTURL: "122.152.193.177",
    MONGODB_USER: 'hg',
    MONGODB_PASSWORD: "123456",
    MONGODB_PORT: '12500',
    REDIS_PORT: '12501',
    REDIS_PASSWORD: "123456",
    SECRET: "hongguang",
    BASE_URL: "http://localhost:8080",
    ROOT_PUBLIC: path.join(__dirname, '../public'),
    SERVER_URL: "http://localhost:3000"
}