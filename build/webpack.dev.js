const path = require('path')
const { merge } = require('webpack-merge')
const baseConfig = require('./webpack.base')

//合并公共配置，并添加开发环境配置
module.exports = merge(baseConfig, {
    mode: 'development',//开发模式，打包更加速度，省去代码优化的步骤
    devtool: 'eval-cheap-module-source-map',//源码调试模式
    devServer: {
        port: 3000,//服务端口号
        compress: false,//gzip压缩，开发模式不开启，提升热更新的速度
        hot: true,//开启热更新
        historyApiFallback: true,//解决history路由404问题
        static: {
            directory: path.join(__dirname, '../public')//托管静态资源public文件夹
        }
    }
})