const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    nickname: String,
    password: String,
    count: Number,
    favs: Number,
    location: String,
    regmark: String
})

userSchema.static('findById', function (id) {
    return this.findOne({
        _id: id
    })
})

const User = mongoose.model('user', userSchema, 'user')

// const run = async () => {
//     const res = await User({
//         username: "2273049646@qq.com",
//         age: 18,
//         email: "2273049646@qq.com",
//         password: '123456'
//     })
//     res.save()
// }
// run()


module.exports = User