const jwt = require('jsonwebtoken')
const {
    getValue,
    setValue
} = require('../config/RedisConnection')
const UserDb = require('../model/user')
const SignDb = require('../model/sign')
const PostDb = require('../model/post')
const {
    SECRET,
    BASE_URL,
    ROOT_PUBLIC,
    SERVER_URL
} = require('../config/index')
const moment = require('moment')
const {
    getInfoByToken
} = require('../utils')

const main = require('../config/MailConfig')
const {
    v4
} = require('uuid')
const makeDir = require('make-dir')
const fs = require('fs')

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
            //判断签到状态
            if (lastSign && moment(lastSign).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD')) {
                userInfo.isSign = true
            } else {
                userInfo.isSign = false
            }
            //返回用户名
            userInfo.username = username
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
        let res = getInfoByToken(ctx)
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
    updateInfo = async ctx => {
        let {
            username,
            nickname,
            gender,
            location,
            regmark
        } = ctx.request.body
        let obj = getInfoByToken(ctx)
        let userInfo = await UserDb.findById(obj.id)
        if (username && userInfo.username !== username) {
            const key = v4()
            setValue(key, jwt.sign({
                    id: obj.id
                },
                SECRET, {
                    expiresIn: '30m'
                }), 60 * 30)
            let type = 'email'
            let url = `${BASE_URL}/#/${type}?key=${key}&username=${username}`


            let res = await main({
                type,
                url,
                expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
                email: userInfo.username,
            })

            return ctx.body = {
                status: 202,
                msg: res
            }
        } else {
            let res = await UserDb.updateOne({
                _id: obj.id
            }, {
                nickname,
                gender,
                location,
                regmark
            })
            if (res.ok == 1) {
                return ctx.body = {
                    status: 200,
                    msg: '修改成功'
                }
            } else {
                return ctx.body = {
                    status: 201,
                    msg: "修改失败"
                }
            }
        }
    }
    updateUserName = async ctx => {
        const {
            key,
            username
        } = ctx.request.body
        let token = await getValue(key)
        let obj = jwt.verify(token, SECRET)
        let res = await UserDb.updateOne({
            _id: obj.id
        }, {
            username
        })
        if (res.ok == 1) {
            return ctx.body = {
                status: 200,
                msg: "修改成功"
            }
        } else {
            return ctx.body = {
                status: 201,
                msg: '修改失败'
            }
        }
    }
    resetPassword = async ctx => {
        const {
            password,
            key
        } = ctx.request.body
        let token = await getValue(key)
        if (!token) {
            ctx.body = {
                status: 201,
                msg: '重置失败'
            }
        }
        let obj = jwt.verify(token, SECRET)
        let res = await UserDb.updateOne({
            _id: obj.id
        }, {
            $set: {
                password: password
            }
        })
        if (res.ok === 1) {
            return ctx.body = {
                msg: "修改密码成功",
                status: 200
            }
        } else {
            ctx.body = {
                msg: '修改密码失败',
                status: 201
            }
        }
    }
    uploadImg = async ctx => {
        try {
            let file = ctx.request.files.file
            let ext = file.name.split('.').pop()
            let pathPublic = `${ROOT_PUBLIC}/${moment().format('YYYYMMDD')}/`
            await makeDir(pathPublic)
            let reader = fs.createReadStream(file.path)
            let fileName = v4() + '.' + ext
            let upStream = fs.createWriteStream(`${pathPublic}/${fileName}`)
            reader.pipe(upStream)
            let pic = SERVER_URL + `/${moment().format('YYYYMMDD')}/` + fileName
            let obj = getInfoByToken(ctx)
            let res = await UserDb.updateOne({
                _id: obj.id
            }, {
                $set: {
                    pic: pic
                }
            })
            ctx.body = {
                status: 200,
                data: {
                    pic
                }
            }
        } catch (e) {
            ctx.body = {
                status: 201,
                msg: '上传错误'
            }
        }
    }
    updatePassword = async ctx => {
        const {
            oldpassword,
            password
        } = ctx.request.body
        let obj = getInfoByToken(ctx)
        let userInfo = await UserDb.findById(obj.id)
        if (userInfo.password == oldpassword) {
            let res = await UserDb.updateOne({
                _id: obj.id
            }, {
                $set: {
                    password
                }
            })
            if (res.ok === 1) {
                ctx.body = {
                    status: 200,
                    msg: "更新密码成功"
                }
            }
        } else {
            ctx.body = {
                status: 201,
                msg: "旧密码错误"
            }
        }

    }
    sendPost = async ctx => {
        let {
            body
        } = ctx.request
        const {
            sid,
            code
        } = body
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
        //新建文章，使用save方法
        let post = JSON.parse(JSON.stringify(body))
        delete post.sid
        delete post.code
        let postSave = new PostDb(post)
        await postSave.save()
        ctx.body = {
            status: 200,
            msg: '上传成功',
        }
    }
}

module.exports = new User()