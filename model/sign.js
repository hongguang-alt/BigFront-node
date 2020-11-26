const mongoose = require('mongoose')
const moment = require('moment')

const Schema = new mongoose.Schema({
    uid: {
        type: String,
        ref: 'user'
    },
    created: {
        type: Date
    },
    fav: String,
    lastSign: Date
})

Schema.pre('save', function (next) {
    this.created = moment().format('YYYY-MM-DD HH:mm:ss')
    next()
})

//添加静态方法查询
Schema.static('findByUid', function (uid) {
    return this.findOne({
        uid
    })
})

const Sign = mongoose.model('sign_record', Schema, "sign_record")

module.exports = Sign