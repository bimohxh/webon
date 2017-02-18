let Helper = require('./helper')
let path = require('path')
let localEnv = Helper.readLocalEnv()
let ignores = localEnv.ignore || []
const readline = require('readline')

let oss = {

  // 验证某个文件是否在忽略列表里面
  isIgnored: (file) => {
    return (ignores || '').split(',').map(item => {
      let regStr = `^${item.trim().replace(/\./g, '\\.').replace(/\*/g, '.+')}$`
      return new RegExp(regStr).test(file)
    }).indexOf(true) > -1
  },

  // 获取要同步的所有文件
  files: () => {
    return Helper.walk(process.cwd()).filter(item => {
      let file = item.split(`${process.cwd()}/`)[1]
      return !oss.isIgnored(file)
    })
  },

  // 获取当前的oss引擎
  engine: () => {
    switch (localEnv.oss) {
      case 'qiniu':
        return require('./qiniu')
      default:
        return null
    }
  }
}



module.exports = {
  deploy: () => {
    let files = oss.files()
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    let engine = oss.engine()
    if (!engine) {
      Helper.msg('不存在要部署到的 oss 类型，目前只支持 qiniu。请运行 webon init 将要部署到的 oss 设置为 qiniu', 'error')
      rl.close()
      return
    }

    Helper.msg('你即将同步的文件是：')
    files.forEach(item => {
      console.log(` ${item.split(`${process.cwd()}/`)[1]}`.grey)
    })

    rl.question('\r\n开始同步？（y / n）: '.red, (answer) => {
      rl.close()
      if (answer.toLocaleLowerCase() === 'y') {
        files.reduce((result, item) => {
          return result.then(() => {
            return oss.engine()['upload'](item)
          })
        }, Promise.resolve()).then(() => {
          Helper.msg('所有同步任务完成 ^_^')
        })
      }
    })
  }
}
