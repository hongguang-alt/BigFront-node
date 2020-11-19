const Router = require("koa-router");
const {
    Home
} = require('../controller/index')

const home = new Router({
    prefix: '/home'
})

home.get('/a', Home.a)

module.exports = home