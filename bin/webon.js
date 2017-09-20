#! /usr/bin/env node

const program = require('commander')
const Helper = require('../lib/helper')
const Init = require('../lib/init')
const Server = require('../lib/server')
const Oss = require('../lib/oss')
const App = require('../lib/app')
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
  .command('new <dir>')
  .description('初始化配置参数')
  .action((dir) => {
    App.new(dir)
  })

program
  .command('config')
  .description('查看配置')
  .action(() => {
    Init.viewConfig()
  })

program
  .command('deploy [dir]')
  .description('部署当前文件到云存储')
  .option('-f, --force', '无需确认，直接同步')
  .option('-r, --remove_prefix', '上传到云端要去除的路径前缀')
  .action((dir, options) => {
    if (!Helper.hasLocalEnv()) {
      Helper.msg('配置文件不存在，请运行 webon init', 'error')
      return
    }
    let args = Helper.cmdArg(program.rawArgs)
    let rp = args.r || args['-remove_prefix']
    Oss.deploy(dir, options.force, rp)
  })

program.parse(process.argv)
