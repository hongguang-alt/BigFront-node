const Router = require("koa-router");
const {
    Public
} = require('../controller/index')

const public = new Router({
    prefix: '/public'
})

//获取验证码
public.get('/svgCaptcha', Public.svgCaptcha)

//发送邮件
public.post('/forget', Public.forget)

//用户名是否相同
public.post('/checkUsername', Public.checkUsername)
//昵称是否相同
public.post('/checkNickname', Public.checkNickname)

//获取列表
public.get('/list', Public.getList)

//友情链接
public.get('/links',Public.getLinks)

//每周热议
public.get('/toWeek',Public.toWeek)

module.exports = public