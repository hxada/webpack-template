_build-webpack.base.js # 公共配置<br/>
build-webpack.dev.js # 开发环境配置<br/>
build-webpack.prod.js # 打包环境配置<br/>
public-index.html # html 模板<br/>
src-index.tsx # react 应用入口页面<br/>
tsconfig.json # ts 配置<br/>_

### 基础构建

安装 webpack 依赖 : npm i webpack webpack-cli -D<br/>
安装 react 依赖 : npm i react react-dom -S<br/>
安装 react 类型依赖 : npm i @types/react @types/react-dom -D<br/>

**--webpack.baee.js**<br/>
安装 babel 核心和预设 : npm i babel-loader @babel/core @babel/preset-react @babel/preset-typescript -D<br/>
配置 extensions，文件后缀名查找<br/>
添加 html-webpack-plugin 插件 : npm i html-webpack-plugin -D<br/>

**--webpack.dev.js**<br/>
安装 webpack-dev-server : npm i webpack-dev-server webpack-merge -D<br/>
在 package.json 的 scripts 中添加 "dev": "webpack-dev-server -c build/webpack.dev.js"<br/>
npm run dev<br/>

**--webpack.prod.js**<br/>
在 package.json 的 scripts 中添加 build 打包命令:"build": "webpack -c build/webpack.prod.js"<br/>
npm run build<br/>
借助 node 服务器 serve 打开 : npm i serve -g serve -s dist<br/>

### 配置环境变量

环境变量按作用分为两种：<br/> 1.开发模式/打包构建模式:process.env.NODE_ENV<br/> 2.业务环境:开发/测试/预测/正式:process.env.BASE_ENV<br/>

安装 cross-env:兼容各系统的设置环境变量的包 npm i cross-env -D<br/>
修改 package.json 的 scripts 脚本字段<br/>
借助 webpack.DefinePlugin:webpack 内置插件，可以为业务代码注入环境变量<br/>
修改 webpack.base.js，配置后会把值注入到业务代码里面去,webpack 解析代码匹配到 process.env.BASE_ENV,就会设置到对应的值<br/>
