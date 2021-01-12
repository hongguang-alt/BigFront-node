const Router = require("koa-router");
const {
    User
} = require('../controller/index')

const user = new Router({
    prefix: "/user"
})

//用户登陆接口
user.post('/login', User.login)
//用户注册接口
user.post('/register', User.register)

//用户点击进行签到的接口
user.get('/sign', User.sign)

//修改个人信息的接口
user.post('/basic', User.updateInfo)

//修改邮箱的接口
user.post('/updateUserName', User.updateUserName)

//重置密码的接口
user.post('/resetPassword', User.resetPassword)

//上传头像接口
user.post('/uploadImg', User.uploadImg)

//修改密码的接口
user.post('/updatePassword',User.updatePassword)

//上传用户帖子的接口
user.post('/sendPost',User.sendPost)

module.exports = user
