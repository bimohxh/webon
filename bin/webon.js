#! /usr/bin/env node

const program = require('commander')
const Helper = require('../lib/helper')
const Init = require('../lib/init')
const Server = require('../lib/server')
const colors = require('colors')


program
  .version(require('../package.json').version)
  .usage('[命令] [参数]')

program
  .command('start')
  .description('启动静态文件服务器')
  .action(() => {
    Server.start()
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

// program
//   .command('copygoods')
//   .description('复制商品')
//   .option('-f, --from', '从该经销商或公司复制所有商品，公司为 c（company） 开头，经销商以 d（delaer） 开头，商品以 g（goods） 开头')
//   .option('-t, --to', '复制给哪个经销商或公司，公司为 c（company） 开头，经销商以 d（delaer） 开头')
//   .action(() => {
//     let args = Helper.cmdArg(program.rawArgs)

//     if (!Helper.hasLocalEnv()) {
//       Helper.msg('配置文件不存在，请执行 dpjgo init 进行配置', 'error')
//       return
//     }

//     if (!args.t && !args.f) {
//       program.commands[0].help()
//       return
//     }

//     if (!args.f) {
//       Helper.msg('你要复制哪个经销商或公司的商品，别忘了 -f 参数', 'error')
//       return
//     }

//     if (!args.t) {
//       Helper.msg('你要复制给哪个经销商或公司，别忘了 -t 参数', 'error')
//       return
//     }

//     Goods.copy(args.t, args.f)
//   })
//   .on('--help', () => {
//     console.log('  示例:')
//     console.log('')
//     console.log('    $ dpjgo copygoods -f c2 -t d3'.blue)
//     console.log('    $ dpjgo copygoods -f g2,g3 -t c4'.blue)
//     console.log('')
//   })




program.parse(process.argv)
