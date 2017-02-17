const Koa = require('koa')
const app = new Koa()
const serve = require('koa-static')
const mount = require('koa-mount')
const path = require('path')
const Helper = require('./helper')

module.exports = {
  start: (port) => {
    port = port || Helper.readLocalEnv().port || 3000
    app.use(mount('/', serve(process.cwd())))
    app.listen(port)
    Helper.msg(`服务器已启动，请访问：http://<IP>:${port}`)
  }
}