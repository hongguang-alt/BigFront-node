const {
    SECRET
} = require('../config')
const jwt = require('jsonwebtoken')

//验证错误信息
const authError = function (ctx, next) {
    return next().catch((err) => {
        console.log(err, 111)
        if (401 == err.status) {
            return ctx.body = {
                status: 201,
                msg: '没有权限'
            }
        } else {
            console.log(err)
            return ctx.body = {
                status: 201,
                msg: err.message | '未知错误'
            }
        }
    });
};

const getInfoByToken = function (ctx) {
    let token = ctx.header.authorization.split(' ')[1]
    let res = jwt.verify(token, SECRET)
    return res
}

module.exports = {
    authError,
    getInfoByToken
}