## Webpack5 搭建 React18+TypeScript 开发和打包环境

### 项目配置文件目录

**公共配置:** build-webpack.base.js <br/>
**开发环境配置:** build-webpack.dev.js <br/>
**打包环境配置:** build-webpack.prod.js <br/>
**分析配置:** build-webpack.analy.js <br/>
**html 模板:** public-index.html <br/>
**react 应用入口页面:** src-index.tsx <br/>
**描述图像（图片）对象的类型信息:** src-images.d.ts <br/>
**ts 配置:** tsconfig.json <br/>
**babel 编译单独配置:** babel/config.js <br/>
**css 自动加前缀:** postcss.config.js <br/>
**浏览器兼容:** .browserslistrc <br/>

### 1️⃣ 基础项目构建

安装 webpack 依赖 : `npm i webpack webpack-cli -D`<br/>
安装 react 依赖 : `npm i react react-dom -S`<br/>
安装 react 类型依赖 : `npm i @types/react @types/react-dom -D`<br/>

**✨webpack.base.js**<br/>
安装 babel 核心和预设 : `npm i babel-loader @babel/core @babel/preset-react @babel/preset-typescript -D`<br/>
配置 extensions，文件后缀名查找<br/>
添加 html-webpack-plugin 插件 : `npm i html-webpack-plugin -D`<br/>

**✨webpack.dev.js**<br/>
安装 webpack-dev-server : `npm i webpack-dev-server webpack-merge -D`<br/>
在 package.json 的 scripts 中添加 `"dev": "webpack-dev-server -c build/webpack.dev.js"`<br/>
`npm run dev`<br/>

**✨webpack.prod.js**<br/>
在 package.json 的 scripts 中添加 build 打包命令:`"build": "webpack -c build/webpack.prod.js"`<br/>
`npm run build`<br/>
借助 node 服务器 serve 打开 : `npm i serve -g serve -s dist`<br/>

#### ✅ 配置环境变量

环境变量按作用分为两种:<br/> 1.开发模式/打包构建模式:`process.env.NODE_ENV`<br/> 2.业务环境:开发/测试/预测/正式:`process.env.BASE_ENV`<br/>

安装 cross-env:兼容各系统的设置环境变量的包 `npm i cross-env -D`<br/>
修改 package.json 的 scripts 脚本字段<br/>
借助 webpack.DefinePlugin:webpack 内置插件，可以为业务代码注入环境变量<br/>
修改 webpack.base.js，配置后会把值注入到业务代码里面去,webpack 解析代码匹配到 process.env.BASE_ENV,就会设置到对应的值<br/>

#### ✅ 配置样式 loader

**🔅style-loader:** 把解析后的 css 代码从 js 中抽离,放到头部的 style 标签中(在运行时做的)<br/>
**🔅css-loader:** 解析 css 文件代码 <br/>
**🔅less-loader:** 解析 less 文件代码,把 less 编译为 css <br/>
**🔅postcss-loader：** 处理 css 时自动加前缀<br/>
autoprefixer：决定添加哪些浏览器前缀到 css 中<br/>
postcss.config.js 是 postcss-loader 的配置文件,会自动读取配置<br/>

`npm i style-loader css-loader -D`<br/>
`npm i less-loader less -D`<br/>
`npm i postcss-loader autoprefixer -D`<br/>

#### ✅ babel 预设处理 js 兼容

需要把最新的标准语法转换为低版本语法,把非标准语法转换为标准语法才能让浏览器识别解析<br/>
**🔅babel-loader:** 使用 babel 加载最新 js 代码并将其转换为 ES5（上面已经安装过）<br/>
@babel/corer: babel 编译的核心包<br/>
@babel/preset-env: babel 编译的预设,可以转换目前最新的 js 标准语法 <br/>
core-js: 使用低版本 js 语法模拟高版本的库,也就是垫片<br/>
@babel/plugin-proposal-decorators 识别装饰器语法<br/>
`npm i babel-loader @babel/core @babel/preset-env core-js -D` <br/>
`npm i @babel/plugin-proposal-decorators -D`<br/>

#### ✅ 复制 public 文件夹

一般 public 文件夹都会放一些静态资源,可以直接根据绝对路径引入,比如图片,css,js 文件等,不需要 webpack 进行解析,只需要打包的时候把 public 下内容复制到构建出口文件夹中<br/>
安装依赖 **〽️copy-webpack-plugin** : `npm i copy-webpack-plugin -D` <br/>

#### ✅ 处理图片字体媒体文件

webpack5 采用 asset-module 处理<br/>
新建图片声明 src/images.d.ts 文件 `declare module '\*.svg'...`<br/>

#### ✅ 配置模块热更新

不需要刷新浏览器的前提下模块热更新,并且能够保留 react 组件的状态<br/>
**〽️@pmmmwh/react-refresh-webpack-plugin 插件**，依赖于 react-refresh<br/>
`npm i @pmmmwh/react-refresh-webpack-plugin react-refresh -D` <br/>
配置 react 热更新插件,修改 webpack.dev.js <br/>
为 babel-loader 配置 react-refesh 刷新插件,修改 babel.config.js 文件<br/>

### 2️⃣ 优化构建速度

#### ✅ 耗时分析

**〽️speed-measure-webpack-plugin 插件**: `npm i speed-measure-webpack-plugin -D`<br/>
新增 webpack 构建分析配置文件 build/webpack.analy.js<br/>
修改 package.json 添加启动 webpack 打包分析脚本命令<br/>
`npm run build:analy`<br/>

#### ✅ 开启持久化存储缓存

在 webpack5 之前做缓存是使用 babel-loader 缓存解决 js 的解析结果,cache-loader 缓存 css 等资源的解析结果,还有模块缓存插件 hard-source-webpack-plugin,配置好缓存后第二次打包,通过对文件做哈希对比来验证文件前后是否一致,如果一致则采用上一次的缓存,可以极大地节省时间。<br/>
webpack5 新增了持久化缓存、改进缓存算法等优化,通过配置 webpack 持久化缓存,来缓存生成的 webpack 模块和 chunk,改善下一次打包的构建速度,可提速 90% 左右。<br/>
修改 webpack.base.js `/cache: {type: 'filesystem',}` // 使用文件缓存,<br/>

#### ✅ 开启多线程 loader

**🔅thread-loader:** webpack 的 loader 默认在单线程执行,现代电脑一般都有多核 cpu,可以借助多核 cpu 开启多线程 loader 解析,可以极大地提升 loader 解析的速度,thread-loader 就是用来开启多进程解析 loader 的,安装依赖 `npm i thread-loader -D`<br/>
将此 loader 放置在其他 loader 之前。放置在此 loader 之后的 loader 会在一个独立的 worker 池中运行<br/>

#### ✅ 配置 alias 别名

webpack 支持设置别名 alias,设置别名可以让后续引用的地方减少路径的复杂度。<br/>
修改 webpack.base.js<br/>
修改 tsconfig.json,添加 baseUrl 和 paths<br/>
配置修改完成后,在项目中使用 @/xxx.xx,就会指向项目中 src/xxx.xx,在 js/ts 文件和 css 文件中都可以用<br/>

#### ✅ 缩小 loader 作用范围

一般第三库都是已经处理好的,不需要再次使用 loader 去解析,可以按照实际情况合理配置 loader 的作用范围,来减少不必要的 loader 解析,节省时间,通过使用 include 和 exclude 两个配置项,可以实现这个功能<br/>
修改 webpack.base.js<br/>

#### ✅ 精确使用 loader

loader 在 webpack 构建过程中使用的位置是在 webpack 构建模块依赖关系引入新文件时，会根据文件后缀来倒序遍历 rules 数组，如果文件后缀和 test 正则匹配到了，就会使用该 rule 中配置的 loader 依次对文件源代码进行处理，最终拿到处理后的 sourceCode 结果<br/>
可以通过**避免使用无用的 loader 解析来提升构建速度**，比如使用 less-loader 解析 css 文件。ts 和 tsx 也是如此，ts 里面是不能写 jsx 语法的，所以可以尽可能避免使用 @babel/preset-react 对 .ts 文件语法做处理。<br/>
注：本项目未分<br/>

#### ✅ 缩小模块搜索范围

node 里面模块有三种：<br />
node 核心模块、node_modules 模块、自定义文件模块<br/>

使用 require 和 import 引入模块时如果有准确的相对或者绝对路径，就会按照路径去查询，如果没有就会优先查询 node 核心模块，如果再没有就会去当前目录下的 node_modules 寻找，没有找到会从父级文件夹查找 node_modules，一直查到系统 node 全局模块<br/>
这样会有两个问题，一个是当前项目没有安装某个依赖，但是上一级目录下 node_modules 或者全局模块有安装，就也会引入成功，但是部署到服务器时可能就会找不到造成报错。另一个问题是一级一级查询比较消耗时间。<br/>
可以告诉 webpack 搜索目录范围来规避这两个问题,修改 webpack.base.js<br/>

#### ✅ devtool 配置

开发过程中或者打包后的代码都是 webpack 处理后的代码,如果进行调试肯定希望看到源代码,而不是编译后的代码, source map 就是用来做源码映射的,不同的映射模式会明显影响到构建和重新构建的速度, devtool 选项就是 webpack 提供的选择源码映射方式的配置。<br/>
devtool 的命名规则为 <br/>
`inline` 代码内通过 dataUrl 形式引入 SourceMap<br/>
`hideen` 生成 SourceMap 文件但不使用<br/>
`eval` eval()形式执行代码，通过 dataUrl 形式引入 SourceMap<br/>
`nosources` 不生成 SourceMap<br/>
`cheap` 只需要定位到行信息，不需要列信息<br/>
`module` 展示源代码中的错误位置 <br/>

**开发环境推荐：**`eval-cheap-module-source-map`<br/>
本地开发首次打包慢点没关系,因为 eval 缓存的原因, 热更新会很快<br/>
开发中,我们每行代码不会写的太长,只需要定位到行就行,所以加上 cheap<br/>
我们希望能够找到源代码的错误,而不是打包后的,所以需要加上 module<br/>

修改 webpack.dev.js: webpack.prod.js 打包环境推荐：none(就是**不配置 devtool 选项了，不是配置 devtool: 'none'**)<br/>

### 3️⃣ 优化构建结果文件

#### ✅ webpack 包分析工具

**〽️webpack-bundle-analyzer** 是分析 webpack 打包后文件的插件,使用交互式可缩放树形图可视化 webpack 输出文件的大小:`npm install webpack-bundle-analyzer -D`<br/>

#### ✅ 抽取 css 样式文件

在开发环境我们希望 css 嵌入在 style 标签里面,方便样式热替换,但打包时我们希望把 css 单独抽离出来,方便配置缓存策略<br />
**〽️mini-css-extract-plugin 插件**: `npm i mini-css-extract-plugin -D`<br/>

#### ✅ 压缩 css 文件

借助 **〽️css-minimizer-webpack-plugin** 来压缩 css: `npm i css-minimizer-webpack-plugin -D`<br/>

#### ✅ 压缩 js 文件

设置 mode 为 production 时,webpack 会使用内置插件 **〽️terser-webpack-plugin** 压缩 js 文件,该插件默认支持多线程压缩,但是配置 optimization.minimizer 压缩 css 后,js 压缩就失效了,需要手动再添加一下,webpack 内部安装了该插件<br/>

#### ✅ 合理配置打包文件 hash

项目维护的时候,一般只会修改一部分代码,可以合理配置文件缓存,来提升前端加载页面速度和减少服务器压力,而 hash 就是浏览器缓存策略很重要的一部分。webpack 打包的 hash 分三种：<br/>

- `hash`：跟整个项目的构建相关,只要项目里有文件更改,整个项目构建的 hash 值都会更改,并且全部文件都共用相同的 hash 值<br/>
- `chunkhash`：不同的入口文件进行依赖文件解析、构建对应的 chunk,生成对应的哈希值,文件本身修改或者依赖文件修改,chunkhash 值会变化<br/>
- `contenthash`：每个文件自己单独的 hash 值,文件的改动只会影响自身的 hash 值<br/>

因为 js 我们在生产环境里会把一些公共库和程序入口文件区分开,单独打包构建,采用 chunkhash 的方式生成哈希值,那么只要我们不改动公共库的代码,就可以保证其哈希值不会受影响,可以继续使用浏览器缓存,所以 **js 适合使用 chunkhash**。<br/>
**css 和图片资源媒体资源一般都是单独存在的,可以采用 contenthash**,只有文件本身变化后会生成新 hash 值。<br/>

#### ✅ 代码分割第三方包和公共模块

一般第三方包的代码变化频率比较小,可以单独把 node_modules 中的代码单独打包, 当第三包代码没变化时,对应 chunkhash 值也不会变化,可以有效利用浏览器缓存，还有公共的模块也可以提取出来,避免重复打包加大代码整体体积, webpack 提供了代码分隔功能, 需要我们手动在优化项 optimization 中手动配置下代码分隔 splitChunks 规则。<br/>

#### ✅ tree-shaking 清理未引用 js

**Tree Shaking** 的意思就是摇树,伴随着摇树这个动作,树上的枯叶都会被摇晃下来,这里的 tree-shaking 在代码中摇掉的是未使用到的代码,也就是未引用的代码,最早是在 rollup 库中出现的,webpack 在 2 版本之后也开始支持。模式 mode 为 production 时就会默认开启 tree-shaking 功能以此来标记未引入代码然后移除掉<br/>

#### ✅ tree-shaking 清理未使用 css

css 中也会有未被页面使用到的样式,可以通过 **〽️purgecss-webpack-plugin 插件**打包的时候移除未使用到的 css 样式,这个插件是和 mini-css-extract-plugin 插件配合使用的,在上面已经安装过,还需要 glob-all 来选择要检测哪些文件里面的类名和 id 还有标签名称<br/>
`npm i purgecss-webpack-plugin@4 glob-all -D`<br/>

插件本身也提供了一些白名单 safelist 属性,符合配置规则选择器都不会被删除掉,比如使用了组件库 antd, purgecss-webpack-plugin 插件检测 src 文件下 tsx 文件中使用的类名和 id 时,是检测不到在 src 中使用 antd 组件的类名的,打包的时候就会把 antd 的类名都给过滤掉,可以配置一下安全选择列表,避免删除 antd 组件库的前缀 ant。<br/>

#### ✅ 资源懒加载

像 react,vue 等单页应用打包默认会打包到一个 js 文件中,虽然使用代码分割可以把 node_modules 模块和公共模块分离,但页面初始加载还是会把整个项目的代码下载下来,其实只需要公共资源和当前页面的资源就可以了,其他页面资源可以等使用到的时候再加载,可以有效提升首屏加载速度。<br/>
webpack 默认支持资源懒加载,只需要引入资源**使用 import 语法来引入资源**,webpack 打包的时候就会自动打包为单独的资源文件,等使用到的时候动态加载。<br/>

#### ✅ 资源预加载

配置了资源懒加载后,虽然提升了首屏渲染速度,但是加载到资源的时候会有一个去请求资源的延时,如果资源比较大会出现延迟卡顿现象,可以借助 link 标签的 rel 属性 prefetch 与 preload,link 标签除了加载 css 之外也可以加载 js 资源,设置 rel 属性可以规定 link 提前加载资源,但是加载资源后不执行,等用到了再执行<br/>

- `preload` 是告诉浏览器页面必定需要的资源,浏览器一定会加载这些资源。
- `prefetch` 是告诉浏览器页面可能需要的资源,浏览器不一定会加载这些资源,会在空闲时加载。<br/>

webpack v4.6.0+ 增加了对预获取和预加载的支持,使用方式也比较简单,在 import 引入动态资源时使用 webpack 的魔法注释<br/>

#### ✅ 打包时生成 gzip 文件

前端代码在浏览器运行,需要从服务器把 html,css,js 资源下载执行,下载的资源体积越小,页面加载速度就会越快。一般会采用 gzip 压缩,现在大部分浏览器和服务器都支持 gzip,可以有效减少静态资源文件大小,压缩率在 70% 左右。<br/>
nginx 可以配置 gzip: on 来开启压缩,但是只在 nginx 层面开启,会在每次请求资源时都对资源进行压缩,压缩文件会需要时间和占用服务器 cpu 资源，更好的方式是前端在打包的时候直接生成 gzip 资源,服务器接收到请求,可以直接把对应压缩好的 gzip 文件返回给浏览器,节省时间和 cpu。<br/>
webpack 可以借助 **〽️compression-webpack-plugin 插件**在打包时生成 gzip 文章,安装依赖<br/>
`npm i compression-webpack-plugin -D`<br/>
