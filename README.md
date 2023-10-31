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

环境变量按作用分为两种:<br/>1.开发模式/打包构建模式:process.env.NODE_ENV<br/>2.业务环境:开发/测试/预测/正式:process.env.BASE_ENV<br/>

安装 cross-env:兼容各系统的设置环境变量的包 npm i cross-env -D<br/>
修改 package.json 的 scripts 脚本字段<br/>
借助 webpack.DefinePlugin:webpack 内置插件，可以为业务代码注入环境变量<br/>
修改 webpack.base.js，配置后会把值注入到业务代码里面去,webpack 解析代码匹配到 process.env.BASE_ENV,就会设置到对应的值<br/>

### 配置样式 loader

style-loader: 把解析后的 css 代码从 js 中抽离,放到头部的 style 标签中(在运行时做的)<br/>
css-loader: 解析 css 文件代码 <br/>
less-loader: 解析 less 文件代码,把 less 编译为 css <br/>
postcss-loader：处理 css 时自动加前缀<br/>
autoprefixer：决定添加哪些浏览器前缀到 css 中<br/>
postcss.config.js 是 postcss-loader 的配置文件,会自动读取配置,根目录新建 postcss.config.js<br/>

npm i style-loader css-loader -D<br/>
npm i less-loader less -D<br/>
npm i postcss-loader autoprefixer -D<br/>

### babel 预设处理 js 兼容

需要把最新的标准语法转换为低版本语法,把非标准语法转换为标准语法才能让浏览器识别解析<br/>
babel-loader: 使用 babel 加载最新 js 代码并将其转换为 ES5（上面已经安装过）<br/>
@babel/corer: babel 编译的核心包<br/>
@babel/preset-env: babel 编译的预设,可以转换目前最新的 js 标准语法 <br/>
core-js: 使用低版本 js 语法模拟高版本的库,也就是垫片<br/>
@babel/plugin-proposal-decorators 识别装饰器语法<br/>
npm i babel-loader @babel/core @babel/preset-env core-js -D <br/>
npm i @babel/plugin-proposal-decorators -D<br/>

### 复制 public 文件夹

一般 public 文件夹都会放一些静态资源,可以直接根据绝对路径引入,比如图片,css,js 文件等,不需要 webpack 进行解析,只需要打包的时候把 public 下内容复制到构建出口文件夹中<br/>
安装依赖 copy-webpack-plugin : npm i copy-webpack-plugin -D <br/>

### 处理图片字体媒体文件

webpack5 采用 asset-module 处理<br/>
新建图片声明 src/images.d.ts 文件 declare module '\*.svg'...<br/>

### 配置模块热更新

不需要刷新浏览器的前提下模块热更新,并且能够保留 react 组件的状态<br/>
借助@pmmmwh/react-refresh-webpack-plugin 插件，依赖于 react-refresh<br/>
npm i @pmmmwh/react-refresh-webpack-plugin react-refresh -D <br/>
配置 react 热更新插件,修改 webpack.dev.js <br/>
为 babel-loader 配置 react-refesh 刷新插件,修改 babel.config.js 文件<br/>

### 优化构建速度
