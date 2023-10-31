const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const isDev = process.env.NODE_ENV === 'development'


module.exports = {
    entry: path.join(__dirname, '../src/index.tsx'),//入口文件
    output: {
        filename: 'static/js/[name].[chunkhash:8].js',//每个输出js的名称,chunkhash:8表示8位hash值
        path: path.join(__dirname, '../dist'),//打包结果的输出路径
        clean: true,//每次打包的时候删除已有的
        publicPath: '/',//打包后文件的公共前缀路径
    },
    module: {
        rules: [
            {
                include: [path.resolve(__dirname, '../src')],//只对项目src文件的ts,tsx文件进行loader解析，其他loader也是一样
                test: /.(ts|tsx)$/,//匹配ts,tsx文件
                use: ['thread-loader', 'babel-loader']//开启多线程,babel具体配置在babel.config.js中
            },
            {
                test: /.css$/, //匹配所有的 css 文件
                include: [path.resolve(__dirname, '../src')],
                use: [
                    isDev ? 'style-loader' : MiniCssExtractPlugin.loader, // 开发环境使用style-looader,打包模式抽离css
                    'css-loader',
                    'postcss-loader'
                ]
            },
            {
                test: /.(png|jpg|jpeg|gif|svg)$/,//匹配图片文件
                type: "asset",
                parser: { dataUrlCondition: { maxSize: 10 * 1024 } },//小于10kb转base64位
                generator: { filename: 'static/images/[name].[contenthash:8][ext]' },//文件输出目录和命名,contenthash:8表示8位hash值
            },
            {
                test: /.(woff2?|eot|ttf|otf)$/,//匹配字体图标文件
                type: "asset",
                parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
                generator: { filename: 'static/fonts/[name].[contenthash:8][ext]' },
            },
            {
                test: /.(mp4|webm|ogg|mp3|wav|flac|acc)$/,//匹配媒体文件
                type: "asset",
                parser: { dataUrlCondition: { maxSize: 10 * 1024 } },
                generator: { filename: 'static/media/[name].[contenthash:8][ext]' }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.tsx', '.ts'],
        alias: { '@': path.join(__dirname, '../src') },//配置@为src目录
        modules: [path.resolve(__dirname, '../node_modules')],//查找第三方模块只在本项目的node_modules中查找
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            inject: true,//自动注入静态资源
        }),
        new webpack.DefinePlugin({
            'process.env.BASE_ENV': JSON.stringify(process.env.BASE_ENV)
        })
    ],
    cache: {
        type: 'filesystem',//使用文件缓存
    }
}

console.log('NODE_ENV', process.env.NODE_ENV)
console.log('BASE_ENV', process.env.BASE_ENV)