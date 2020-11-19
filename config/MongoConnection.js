const mongoose = require('mongoose')
const {
    HOSTURL,
    MONGODB_USER,
    MONGODB_PASSWORD,
    MONGODB_PORT
} = require('./index')

mongoose.connect(`mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${HOSTURL}:${MONGODB_PORT}/testdb`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('mongodb数据库连接成功！')
}).catch(() => {
    console.log('mongodb数据库连接失败')
})