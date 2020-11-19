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
user.post('/register',User.register)


module.exports = user