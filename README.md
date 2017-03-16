# webon
[![npm](https://img.shields.io/npm/v/webon.svg)]()
[![npm](https://img.shields.io/npm/dt/webon.svg)]()

一个用于开发和部署静态网页的 node 命令行工具

![](https://raw.githubusercontent.com/bimohxh/webon/master/demo/logo.png)

## 为什么会有 webon 
很多时候我们都会有这种需求，做一些静态网页放到服务器上面运行，比如说官网页面或者静态博客或者个人在线简历等等。

### 开发 
在本地开发静态页面可以直接打开 html 预览，不过这里面也存在问题，对于字体文件和svg文件的引用是会报错的，必须要运行在一个本地服务器上面。
有很多服务器可供选择，比如 nginx，但是这些都太重，轻量一点的如 `python -m SimpleHTTPServer 8080`，但是运行效率却不好。

 针对这个问题，webon 提供了基于 koa 框架的静态文件服务器，只需要运行 `webon s` 即可启动一个快速的开发服务器

### 部署
常见的方式是将源码托管到 GitHub上，然后创建一个可以运行静态站点分支即可，但是这里也有一个问题，就是国内的访问速度有点慢，有同学会说，国内也有 coding 啊，的确，速度会比 GitHub好，但是如果你想让你的静态页面像一个普通网站一样运行并且被用户很快访问的话，oss cdn 绝对是最佳选择，同样也可以是免费的，但是速度上秒杀各种git托管平台。

鉴于此， webon 提供了简单的部署方式，只需配置好相关参数，运行 `webon deploy` 即可将整个页面资源部署到 oss 上。

而且 webon 可以支持多种 oss 源：阿里云（`aliyun`）和七牛云（`qiniu`）。推荐七牛，原因是存储空间和流量的免费额度比较高，而且速度很快，接下来会对更多oss进行支持。


## 开始

### 1、安装 webon
通过 npm 安装到全局环境下

```
npm install webon -g
```
安装完成后可以执行 `webon -h` 查看命令相关的帮助项。


### 2、初始化项目配置

在项目的根目录下运行下面的命令初始化开发必要的配置：

```
webon init
```

![](https://raw.githubusercontent.com/bimohxh/webon/master/demo/demo3.png)

接下来会提示你各项参数的配置，配置完成后会在当前目录下生成一个名为 `webon.config.json` 文件，你可以通过 `webon config` 来查看当前的配置信息，当然也可以直接打开配置文件进行编辑。

注意：由于配置文件有账户敏感信息，别忘了将 `webon.config.json` 加入 `.gitignore` 中去，

### 3、运行开发环境

接下来就可以直接运行下面的命令来启动开发服务器了：

```
webon s
```
![](https://raw.githubusercontent.com/bimohxh/webon/master/demo/demo2.png)


这里可以通过 `-p` 参数指定当前项目服务器运行的端口，这会覆盖第 2 步中的 `port` 项目全局配置项。

然后就可以在浏览器中打开 `http://[ip]:[port]` 查看页面了。

### 4、部署

网站开发完毕后，我们可以运行下面的命令来一键部署

```
webon deploy
```

![](https://raw.githubusercontent.com/bimohxh/webon/master/demo/demo1.png)


这里会有一个确认信息，告诉你具体会同步哪些文件，然后输入 `y` 确认同步，否则将取消。

之所以这样做是因为，并非所有文件都需要同步到 oss 上，比如各种 log 文件和配置文件，那么这里我们在第 2 步的配置中会配置上要忽略的同步文件类型 `ignore`，里面提供了一些默认的，当然最终需要自定义成自己需要的。

对应的我们提供了 `whitelist` 白名单配置项，如果存在该配置且不为空，则忽略 `ignore`


#### 缓存
部署到七牛上的资源是有缓存的，比如替换掉 index.html 文件，再次访问时你会发现仍然是上次的内容，并没有改变。这是因为七牛给所有的资源都加入了缓存，所以需要更新改变后的文件缓存，这里如果用七牛官方提供的工具，其实操作都很不方便。

而 webon 则会自动检测更新后的文件，然后更新其缓存。在项目根目录下有一个文件 `webon.log.json` 这是记录每个资源hash的日志文件，推荐加入到版本控制中，因为每次更新都会检测这个文件中的所有资源的 hash 值以知道其是否更新了。

注意：更新缓存后马上访问你会发现其实依旧没有更新，这是由于七牛CDN缓存分布区域更新有延迟，事实上已经成功发起了刷新缓存的请求，过几分钟后看就没问题了。

## 脚手架
为了方便大家新建一个新的静态web项目，我们提供了一个简单的脚手架来创建必要的文件和文件夹：

```
webon new [项目目录名]
```

![](https://raw.githubusercontent.com/bimohxh/webon/master/demo/demo4.png)

这样就可以创建一个新的项目了，然后进入该项目执行上面的操作。生成的项目目录结构如下：

```
app
├─ .gitignore
├─ css
│    └─ .keep
├─ img
│    └─ .keep
├─ index.html
├─ js
│    └─ .keep
└─ svg
       └─ .keep
```
