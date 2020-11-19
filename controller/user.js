const jwt = require('jsonwebtoken')
const {
    getValue
} = require('../config/RedisConnection')
const UserDb = require('../model/user')
const {
    SECRET
} = require('../config/index')

class User {
    constructor() {}
    login = async ctx => {
        const {
            username,
            password,
            code,
            sid
        } = ctx.request.body
        //验证验证码
        let resSid = await getValue(sid)
        if (!resSid) {
            return ctx.body = {
                msg: "图片验证码已经过期",
                status: 201
            }
        } else if (resSid.toLocaleLowerCase() !== code.toLocaleLowerCase()) {
            return ctx.body = {
                msg: '验证码错误',
                status: 201
            }
        }
        //验证账号密码
        let res = await UserDb.findOne({
            username
        })
        if (res && res.password === password) {
            let token = jwt.sign({
                    username: res.username,
                    id: res.id
                },
                SECRET, {
                    expiresIn: 60 * 60 * 24
                })
            return ctx.body = {
                msg: '登陆成功',
                status: 200,
                token
            }
        } else {
            return ctx.body = {
                msg: '登陆失败,账号或者用户名错误',
                status: 201
            }
        }
    }
    register = async ctx => {
        const {
            username,
            nickname,
            password,
            sid,
            code
        } = ctx.request.body
        //验证验证码
        let resSid = await getValue(sid)
        if (!resSid) {
            return ctx.body = {
                msg: "图片验证码已经过期",
                status: 201
            }
        } else if (resSid.toLocaleLowerCase() !== code.toLocaleLowerCase()) {
            return ctx.body = {
                msg: '验证码错误',
                status: 201
            }
        }
        //存储登陆信息
        let res = new UserDb({
            username,
            password,
            nickname
        })
        await res.save()
        ctx.body = {
            msg: '注册成功',
            status: 200
        }
    }
}

module.exports = new User()