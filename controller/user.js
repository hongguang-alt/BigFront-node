const jwt = require('jsonwebtoken')
const {
    getValue
} = require('../config/RedisConnection')
const UserDb = require('../model/user')
const SignDb = require('../model/sign')
const {
    SECRET
} = require('../config/index')
const moment = require('moment')

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
                    id: res._id
                },
                SECRET, {
                    expiresIn: 60 * 60 * 24
                })
            let userInfo = res.toJSON()
            let arr = ['password', 'username', 'roles']
            arr.map(item => {
                delete userInfo[item]
            })
            let signInfo = await SignDb.findByUid(res.id) || {}
            let {
                lastSign
            } = signInfo
            if (lastSign && moment(lastSign).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                userInfo.isSign = true
            } else {
                userInfo.isSign = false
            }
            return ctx.body = {
                msg: '登陆成功',
                status: 200,
                token,
                data: userInfo
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
    sign = async ctx => {
        let token = ctx.header.authorization.split(' ')[1]
        let res = jwt.verify(token, SECRET)
        let signInfo = await SignDb.findByUid(res.id)
        let userInfo = await UserDb.findById(res.id)
        let data = {
            favs: 5,
            count: 1
        }
        //不存在用户签到记录
        if (!signInfo) {
            await UserDb.updateOne({
                _id: res.id
            }, {
                $set: {
                    count: 1
                },
                $inc: {
                    favs: 5
                }
            })
            //存放时间表，当前添加的分数
            let newSing = SignDb({
                uid: res.id,
                fav: 5,
                lastSign: moment()
            })
            await newSing.save()
        } else {
            //存在用户签到,判断是否连续签到
            let {
                lastSign
            } = signInfo
            let addfav = 0
            //判断边界值
            let count = userInfo.count + 1
            if (count < 5) {
                addfav = 5
            } else if (count >= 5) {
                addfav = 10
            } else if (5 < count <= 15) {
                addfav = 15
            } else if (15 < count <= 30) {
                addfav = 20
            } else if (30 < count <= 100) {
                addfav = 30
            } else if (100 < count <= 365) {
                addfav = 50
            }
            //是连续签到
            if (moment(lastSign).format('YYYY-MM-DD') === moment().subtract(1, "days").format('YYYY-MM-DD')) {
                await UserDb.updateOne({
                    _id: signInfo.uid
                }, {
                    $inc: {
                        count: 1,
                        favs: addfav
                    }
                })
                await SignDb.updateOne({
                    uid: res.id
                }, {
                    $set: {
                        lastSign: moment()
                    }
                })
            } else if (moment(lastSign).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                return ctx.body = {
                    status: 201,
                    msg: '已经签到过了'
                }
            } else {
                await UserDb.updateOne({
                    _id: signInfo.uid
                }, {
                    $set: {
                        count: 1,
                    },
                    $inc: {
                        favs: 5
                    }
                })
                await SignDb.updateOne({
                    uid: res.id
                }, {
                    $set: {
                        lastSign: moment()
                    }
                })
            }
            //获取新的数据
            let newUserInfo = await UserDb.findById(res.id)
            data = {
                favs: newUserInfo.favs,
                count: newUserInfo.count
            }
        }
        ctx.body = {
            status: 200,
            msg: '签到成功',
            data
        }
    }
}

module.exports = new User()