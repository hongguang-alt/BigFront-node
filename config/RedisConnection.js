const redis = require("redis");
const {
    REDIS_PORT,
    REDIS_PASSWORD,
    HOSTURL
} = require('./index')
const {
    promisify
} = require("util");

const options = {
    host: HOSTURL,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    detect_buffers: true,
    retry_strategy: function (options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    },
}

const client = redis.createClient(options);

client.on("error", function (error) {
    console.error(error);
});

client.on('connect', function (value) {
    console.log('redis链接成功!')
})

//将get方法设置成promise的方法
const get = promisify(client.get).bind(client);
const hgetall = promisify(client.hgetall).bind(client)


//存放普通类型，对象，数组，函数
const setValue = (key, value, time) => {
    if (typeof key !== 'string') return
    if (typeof value === 'string' | typeof value === 'number' | typeof value === null | typeof value === 'undefined') {
        if (typeof time !== 'undefined') {
            return client.set(key, value, 'EX', time)
        } else {
            return client.set(key, value)
        }
    } else if (typeof value === 'object' | typeof value === 'array') {
        Object.keys(value).forEach((item) => {
            client.hmset(key, item, value[item])
        })
    }
}

const getValue = (key) => {
    return get(key)
}

const getHValue = (key) => {
    return hgetall(key)
}

module.exports = {
    client,
    getValue,
    getHValue,
    setValue
}