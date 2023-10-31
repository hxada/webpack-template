const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
    entry: path.join(__dirname, '../src/index.tsx'),//入口文件
    output: {
        filename: 'static/js/[name].js',//每个输出js的名称
        path: path.join(__dirname, '../dist'),//打包结果的输出路径
        clean: true,//每次打包的时候删除已有的
        publicPath: '/',//打包后文件的公共前缀路径
    },
    module: {
        rules: [
            {
                test: /.(ts|tsx)$/,//匹配ts,tsx文件
                use: 'babel-loader'//具体配置在babel.config.js中
            },
            {
                test: /\.(css|less)$/,//匹配css和less文件
                use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader']
            },
            {
                test: /.(png|jpg|jpeg|gif|svg)$/,//匹配图片文件
                type: "asset",
                parser: { dataUrlCondition: { maxSize: 10 * 1024 } },//小于10kb转base64位
                generator: { filename: 'static/images/[name][ext]' },//文件输出目录和命名
            },
            {
                test: /.(woff2?|eot|ttf|otf)$/,//匹配字体图标文件
                type: "asset",
                parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
                generator: { filename: 'static/fonts/[name][ext]' },
            },
            {
                test: /.(mp4|webm|ogg|mp3|wav|flac|acc)$/,//匹配媒体文件
                type: "asset",
                parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
                generator: { filename: 'static/media/[name][ext]' }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.tsx', '.ts'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            inject: true,//自动注入静态资源
        }),
        new webpack.DefinePlugin({
            'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV)
        })
    ]
}

console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)