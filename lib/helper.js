const colors = require('colors')

module.exports = {

  // 读取local_env 配置
  readLocalEnv: () => {
    let LocalEnv = {API: {}}
    try {
      LocalEnv = require('../config/local_env.json')
    } catch (ex) {}

    return LocalEnv
  },

  hasLocalEnv: () => {
    try {
      require('../config/local_env.json')
      return true
    } catch (ex) {
      return false
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
      rl.question((str + '：').grey, (answer) => {
        reciver[key] = answer
        resolve()
      })
    })
  }
}