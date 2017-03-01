const colors = require('colors')
const fs = require('fs')
const path = require('path')

let configPath = path.resolve(process.cwd(), './webon.config.json')
let Helper = {

  // 读取配置文件
  readLocalEnv: () => {
    let LocalEnv = {qiniu: {}}
    try {
      LocalEnv = require(configPath)
    } catch (ex) {}

    return LocalEnv
  },

  hasLocalEnv: () => {
    try {
      require(configPath)
      return true
    } catch (ex) {
      return false
    }
  },

  // 读取hash log
  readHashLog: () => {
    let hashFile = path.resolve(process.cwd(), './webon.log.json')
    try {
      return require(hashFile)
    } catch (ex) {
      return undefined
    }
  },

  // 解析命令参数
  cmdArg: (rawArgs) => {
    let result = {}
    let index = 0

    rawArgs.forEach(item => {
      if (item[0] === '-') {
        let next = (rawArgs[index + 1] && rawArgs[index + 1][0] !== '-') ? rawArgs[index + 1] : undefined
        result[item.substring(1)] = next
      }
      index++
    })

    return result
  },

  // 打印消息
  msg: (msg, type) => {
    colors.setTheme({
      silly: 'rainbow',
      input: 'grey',
      verbose: 'cyan',
      prompt: 'grey',
      info: 'green',
      data: 'grey',
      help: 'cyan',
      warn: 'yellow',
      debug: 'blue',
      error: 'red'
    })

    type = type || 'info'
    console.log('\r\n ' + colors[type](msg) + '\r\n')
  },

  // 输入命令
  enter: (rl, name, reciver, key, defaultVal) => {
    return new Promise(resolve => {
      let str = name
      if (defaultVal !== undefined) {
        str += `（${defaultVal}）`
      }
      rl.question((` ${str}：`.cyan), (answer) => {
        reciver[key] = (answer.trim() === '' ? (defaultVal === undefined ? '' : defaultVal) : answer)
        resolve()
      })
    })
  },

  // 浏览文件夹下的所有文件
  walk: (dir, level) => {
    let results = []
    let list = fs.readdirSync(dir)
    list.forEach((file) => {
      file = dir + '/' + file
      var stat = fs.statSync(file)
      if (stat && stat.isDirectory()) {
        results = results.concat(Helper.walk(file))
      } else {
        results.push(file)
      }
    })

    return Helper.getFilesByLevel(dir, results, level)
  },

  getFilesByLevel: (dir, files, level) => {
    if (!level) return files
    if (!/\/$/.test(dir)) dir += '/'
    return files.filter((item) => {
      return item.split(dir)[1].split('/').length === level
    })
  },

  // 格式化要上传的文件名
  uploadFileName: (file) => {
    let approot = path.resolve(path.dirname(__dirname), process.cwd()) + '/'
    return file.split(approot)[1]
  },

  // 计算文件MD5值
  fileMD5: (file) => {
    var crypto = require('crypto')
    var hash = crypto.createHash('md5')
    hash.update(fs.readFileSync(file))
    return hash.digest('hex')
  }


}


module.exports = Helper
