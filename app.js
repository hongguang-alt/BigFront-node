const Koa = require('koa')
const app = new Koa()
const router = require('./router/index.js')
const KoaBody = require('koa-body')
const cors = require('koa2-cors')
const helmet = require('koa-helmet')
const statics = require('koa-statics')
const path = require('path')
const KoaJwt = require('koa-jwt')
require('./config/MongoConnection')
require('./config/RedisConnection')
const {
    SECRET
} = require('./config/index')
const {
    authError
} = require('./utils')

//解决跨域问题
app.use(cors())
//保证中间件的安全
app.use(helmet())
//获取参数
app.use(KoaBody())
//提供静态资源
app.use(statics(path.join(__dirname, '../public')))


//对于权限错误进行验证
//中间件错误了就不会往下执行了，这样的话，这个中间件写在token验证后面，就根本不会执行
app.use(authError)


//进行token的验证
app.use(KoaJwt({
    secret: SECRET
}).unless({
    path: [/^\/user\/login/, /^\/user\/register/, /^\/public/]
}));


//路由的配置
app.use(router())

app.listen(3000, () => {
    console.log('服务启动成功，请访问3000端口！')
})