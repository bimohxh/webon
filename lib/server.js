const Koa = require('koa')
const app = new Koa()
const serve = require('koa-static')
const mount = require('koa-mount')
const path = require('path')

module.exports = {
  start: () => {
    app.use(mount('/', serve(process.cwd())))
    app.listen(1100)
    console.log('服务器已启动')
  }
}