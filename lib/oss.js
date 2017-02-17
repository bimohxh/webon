let qn = require('./qiniu')
let Helper = require('./helper')
let path = require('path')
let localEnv = Helper.readLocalEnv()
let ignores = localEnv.ignore || []
const readline = require('readline')

let oss = {
  // 验证某个文件是否在忽略列表里面
  isIgnored: (file) => {
    return ignores.map(item => {
      let regStr = `^${item.replace(/\./g, '\\.').replace(/\*/g, '[^\\.]+')}$`
      return new RegExp(regStr).test(file)
    }).indexOf(true) > -1
  },

  // 获取要同步的所有文件
  files: () => {
    return Helper.walk(process.cwd()).filter(item => {
      let file = item.split(`${process.cwd()}/`)[1]
      console.log(file, oss.isIgnored(file))
      return !oss.isIgnored(file)
    })
  }
}



module.exports = {
  deploy: () => {
    let files = oss.files()
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    Helper.msg('你即将同步的文件是：')
    files.forEach(item => {
      console.log(` ${item.split(`${process.cwd()}/`)[1]}`.grey)
    })

    rl.question('\r\n开始同步？（y / n）:'.red, (answer) => {
      rl.close()
      if (answer.toLocaleLowerCase() === 'y') {
        files.reduce((result, item) => {
          return result.then(() => {
            return qn.upload(item)
          })
        }, Promise.resolve()).then(() => {
          Helper.msg('所有同步任务完成 ^_^')
        })
      }
    })
  }
}
