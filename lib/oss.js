let Helper = require('./helper')
let path = require('path')
var fs = require('fs')
let localEnv = Helper.readLocalEnv()
let ignores = localEnv.ignore || []
const readline = require('readline')
let hashs = Helper.readHashLog()

let ossMaps = {
  qiniu: {
    action: () => { return require('./qiniu') },
    name: '七牛云'
  },
  aliyun: {
    action: () => { return require('./aliyun') },
    name: '阿里云OSS'
  }
}


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

  // 记录文件的hash值
  recordHash: (file, refreshdAction) => {
    hashs = Helper.readHashLog()
    let hash = Helper.fileMD5(file)
    let fullname = path.resolve(process.cwd(), './webon.log.json')
    let shortname = Helper.uploadFileName(file)
    return new Promise(resolve => {
      if (hashs) {
        if (hashs[shortname]) {
          if (hashs[shortname] !== hash) {
            hashs[shortname] = hash
            fs.writeFileSync(fullname, JSON.stringify(hashs))
            if (refreshdAction) {
              refreshdAction(file).then(() => {
                resolve(true)
              })
            } else {
              resolve(false)
            }
          } else { resolve(false) }
        } else {
          hashs[shortname] = hash
          fs.writeFileSync(fullname, JSON.stringify(hashs))
          resolve(false)
        }
      } else {
        let tmp = {}
        tmp[shortname] = hash
        fs.writeFileSync(fullname, JSON.stringify(tmp))
        resolve(false)
      }
    })
  },

  // 判断某个文件是否被更新
  isRefresh: (file) => {
    let filename = Helper.uploadFileName(file)
    let hash = Helper.fileMD5(file)
    if (hashs && hashs[filename] && hash === hashs[filename]) {
      console.log(`${filename} 未更新`.grey)
      return false
    }
    return true
  }
}



module.exports = {
  deploy: () => {
    let files = oss.files()
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    
    if (!ossMaps[localEnv.oss]) {
      Helper.msg('要部署到的 oss 类型不合法，目前只支持 qiniu 和 aliyun。请运行 webon init 进行设置', 'error')
      rl.close()
      return
    }

    let config = localEnv[localEnv.oss]

    if (!config) {
      Helper.msg(`缺少 ${ossMaps[localEnv.oss].name} 详细参数配置，请运行 webon init 进行设置`, 'error')
      rl.close()
      return
    }

    let engine = ossMaps[localEnv.oss].action()

    let uploadAction = engine['upload']
    let refreshdAction = engine['refresh']
    Helper.msg(`目标云存储：【${ossMaps[localEnv.oss].name}】  目标 bucket：【${config.bucket}】`)
    Helper.msg('你即将同步的文件是：')
    files.forEach(item => {
      console.log(` ${item.split(`${process.cwd()}/`)[1]}`.grey)
    })

    rl.question('\r\n开始同步？（y / n）: '.red, (answer) => {
      rl.close()
      if (answer.toLocaleLowerCase() === 'y') {
        files.reduce((result, item) => {
          return result.then(() => {
            return new Promise(resolve => {
              if (!oss.isRefresh(item)) {
                resolve()
              } else {
                uploadAction(item)
                .then(() => {
                  return oss.recordHash(item, refreshdAction)
                })
                .then((isRefresh) => {
                  console.log(`${Helper.uploadFileName(item)} 同步成功 ${isRefresh ? '并刷新缓存' : ''}`.cyan)
                  resolve()
                })
              }
            })
          })
        }, Promise.resolve()).then(() => {
          Helper.msg('所有同步任务完成 ^_^')
        })
      }
    })
  }
}
