const mongoose = require('mongoose')
const moment = require('moment')

//post的一些参数
const Schema = new mongoose.Schema({
    uid: {
        type: String,
        ref: 'user'
    },
    title: String,
    content: String,
    catalog: String,
    fav: String,
    isEnd: {
        type: String,
        default: "0"
    },
    reads: {
        type: Number,
        default: 0
    },
    answer: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: "0"
    },
    isTop: {
        type: String,
        default: "0"
    },
    //置顶的排序
    sort: {
        type: String,
        default: "100"
    },
    tags: {
        type: Array,
        default: []
    },
    created: {
        type: Date
    },
})

//设置虚拟属性
/*
  Schema.virtual('user', {
    ref: 'user',
    localField: 'uid',
    foreignField: '_id'})
*/


Schema.pre('save', function (next) {
    this.created = moment().format('YYYY-MM-DD HH:mm:ss')
    next()
})

//查询列表
Schema.static('getList', function (options, sort, page, limit) {
    return this.find(options)
        //按照某个字段的倒序排列
        .sort({
            [sort]: -1
        })
        // .skip(page * limit)
        // .limit(limit)
        //解析uid，依赖于user这个表
        .populate({
            path: 'uid',
            select: 'nickname isVip pic'
        })
})
//查询每周热议
Schema.static('getTopWeek', function () {
    return this.find({
            created: {
                $gte: moment().subtract(7, 'days')
            }
        }, 'answer title').sort({
            answer: -1
        })
        .limit(15)
})
//添加静态方法
Schema.static = {
    /**
     * 获取文章列表数据
     * @param {Object} options 筛选条件
     * @param {String} sort 排序方式
     * @param {Number} page 分页页数
     * @param {Number} limit 分页条数
     */
    getList: function (options, sort, page, limit) {
        return this.find(options)
            //按照某个字段的倒序排列
            .sort({
                [sort]: -1
            })
            .skip(page * limit)
            .limit(limit)
            //解析uid，依赖于user这个表
            .populate({
                path: 'uid',
                select: 'name isVip pic'
            })
    },
    countList: function (options) {
        return this.find(options).countDocuments()
    },
    getTopWeek: function () {
        return this.find({
                created: {
                    $gte: moment().subtract(7, 'days')
                }
            }, 'answer title').sort({
                answer: -1
            })
            .limit(15)
    },
    //根据uid查询数据
    findByTid: function (id) {
        return this.findOne({
            _id: id
        }).populate({
            path: 'uid',
            select: 'name pic isVip _id'
        })
    },
    //默认根据用户获取列表
    getListByUid: function (id, page, limit) {
        return this.find({
                uid: id
            })
            .skip(page * limit)
            .limit(limit)
            .sort({
                created: -1
            })
    },
    countByUid: function (id) {
        return this.find({
            uid: id
        }).countDocuments()
    },
    getHotPost: function (page, limit, start, end) {
        let query = {}
        if (start !== '' && end !== '') {
            query = {
                created: {
                    $gte: start,
                    $lt: end
                }
            }
        }
        return this.find(query)
            .skip(limit * page)
            .limit(limit)
            .sort({
                answer: -1
            })
    },
    getHotPostCount: function (page, limit, start, end) {
        let query = {}
        if (start !== '' && end !== '') {
            query = {
                created: {
                    $gte: start,
                    $lt: end
                }
            }
        }
        return this.find(query).countDocuments()
    }
}

const Post = mongoose.model('post', Schema, "post")

module.exports = Post