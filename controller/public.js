const mySvgCaptcha = require('svg-captcha')
const moment = require('moment')
const main = require('../config/MailConfig')
const UserDb = require('../model/user')
const {
    setValue
} = require('../config/RedisConnection')

class Public {
    constructor() {}
    svgCaptcha = async ctx => {
        const {
            uuid
        } = ctx.query
        let captcha = mySvgCaptcha.create({
            size: 4,
            ignoreChars: '0o1i',
            noise: 1,
            color: true
        });
        if (uuid) {
            setValue(uuid, captcha.text, 60 * 5)
        }
        ctx.body = {
            data: captcha.data,
            status: 200,
            msg: "获取验证码成功！"
        }
    }
    forget = async ctx => {
        const {
            body
        } = ctx.request
        let res = await main({
            code: '1234',
            expire: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
            email: body.username,
            user: 'hongguang'
        })
        ctx.body = {
            status: 200,
            data: res,
            msg: '邮件发送成功'
        }
    }
    checkUsername = async ctx => {
        const {
            username
        } = ctx.request.body
        let res = await UserDb.findOne({
            username
        })
        let data = false
        if (res !== null) {
            data = true
        }
        return ctx.body = {
            status: 200,
            msg: '确认成功',
            data
        }
    }
    checkNickname = async ctx => {
        const {
            nickname
        } = ctx.request.body
        let res = await UserDb.findOne({
            nickname
        })
        let data = false
        if (res !== null) {
            data = true
        }
        return ctx.body = {
            status: 200,
            msg: '确认成功',
            data
        }
    }
    getList = async ctx => {
        const {
            type
        } = ctx.request.query
        if (type === '0') {
            ctx.body = {
                status: 200,
                data: require('../mock/getList'),
                msg: '获取列表成功'
            }
        } else {
            ctx.body = {
                status: 200,
                data: require('../mock/getTop'),
                msg: '获取列表成功'
            }
        }
    }
    //友情链接
    getLinks = async ctx => {
        const {
            type
        } = ctx.request.query
        if (type === 'links') {
            ctx.body = {
                status: 200,
                msg: '获取友情链接成功',
                data: require('../mock/getLinks').links
            }
        } else {
            ctx.body = {
                status: 200,
                msg: '获取温馨提示成功',
                data: require('../mock/getLinks').tips
            }
        }
    }

    toWeek = async ctx => {
        ctx.body = {
            msg: '获取成功',
            status: 200,
            data: require('../mock/toweek')
        }
    }
}


module.exports = new Public()