#! /usr/bin/env node

const program = require('commander')
const Helper = require('../lib/helper')
const Init = require('../lib/init')
const Server = require('../lib/server')
const Oss = require('../lib/oss')
const colors = require('colors')


program
  .version(require('../package.json').version)
  .usage('[命令] [参数]')

program
  .command('s')
  .description('启动静态文件服务器')
  .option('-p, --port', '指定端口，将会覆盖配置文件中的 port 配置')
  .action(() => {
    let args = Helper.cmdArg(program.rawArgs)
    Server.start(args.p)
  })

program
  .command('init')
  .description('初始化配置参数')
  .action(() => {
    Init.config()
  })

program
  .command('config')
  .description('查看配置')
  .action(() => {
    Init.viewConfig()
  })

program
  .command('deploy')
  .description('部署当前文件到云存储')
  .option('-d, --dist', '选择目标云存储，目前支持 qiniu。将覆盖配置文件中的 oss 配置')
  .action(() => {
    if (!Helper.hasLocalEnv()) {
      Helper.msg('配置文件不存在，请运行 webon init', 'error')
      return
    }
    Oss.deploy()
  })



program.parse(process.argv)
