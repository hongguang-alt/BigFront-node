const path = require('path')
const nodeExcternals = require('webpack-node-externals')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')


module.exports = {
    target: 'node',
    mode: 'development',
    entry: {
        serve: path.join(__dirname, 'app.js')
    },
    output: {
        filename: '[name].bundle.js',
        path: path.join(__dirname, 'dist')
    },
    devtool: 'eval-source-map',
    module: {
        rules: [{
            test: /\.js$/,
            use: {
                loader: 'babel-loader'
            },
            exclude: [path.join(__dirname, '/node_modules')]
        }]
    },
    //去除一些我们不会使用的模块
    externals: [nodeExcternals()],
    plugins: [new CleanWebpackPlugin()],
    node: {
        console: true,
        global: true,
        process: true,
        Buffer: true,
        __firename: true,
        __dirname: true,
        setImmediate: true,
        path: true
    }
}