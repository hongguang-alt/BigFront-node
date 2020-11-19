class Home {
    constructor() {}
    a = async ctx => {
        ctx.body = {
            msg: '成功访问'
        }
    }
}

module.exports = new Home()