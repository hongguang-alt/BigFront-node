const combineRouters = require('koa-combine-routers')

const user = require('./user')
const home = require('./home')
const public = require('./public')


//合并路由
module.exports = combineRouters(
    user, home, public
)