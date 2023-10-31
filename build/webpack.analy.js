const prodConfig = require('./webpack.prod.js') //引入打包配置
const { merge } = require('webpack-merge') //引入合并webpack配置方法
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')//引入webpack打包速度分析插件
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')//引入webpack打包结果分析插件

const smp = new SpeedMeasurePlugin();//实例化分析插件
module.exports = smp.wrap(merge(prodConfig, {//使用smp.wrap方法，把生产环境配置传进去
    plugins: [
        new BundleAnalyzerPlugin()//使用打包结果分析插件
    ]

})) 