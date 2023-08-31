const path = require('path')
const DashboardPlugin = require('webpack-dashboard/plugin')

module.exports = {
    entry: '.src/App.js',
    mode: 'development',
    devtool: false,
    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    },
    plugins: [new DashboardPlugin()]
}