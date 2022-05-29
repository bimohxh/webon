let Helper = require('./helper')
let path = require('path')
var fs = require('fs')
let localEnv = Helper.readLocalEnv()
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


let testIgnore = (list, file) => {
  return (list || '').split(',').map(item => {
    let regStr = `^${item.trim().replace(/\./g, '\\.').replace(/\*/g, '.+')}$`
    return new RegExp(regStr).test(file)
  })
}

let oss = {

  // 验证某个文件是否在忽略列表里面
  isIgnored: (file) => {
    if (localEnv.whitelist && localEnv.whitelist.trim() !== '') {
      return testIgnore(localEnv.whitelist, file).indexOf(true) < 0
    }
    return testIgnore(localEnv.ignore, file).indexOf(true) > -1
  },

  // 获取要同步的所有文件
  files: (dir) => {
    let root = process.cwd()
    if (typeof dir === 'string') {
      root = path.resolve(root, dir)
    }
    return Helper.walk(root, false, {white: localEnv.whitelist, black: localEnv.ignore}).filter(item => {
      let file = item.split(`${root}/`)[1]
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
  },

  // sync files
  syncFiles: (files, removePrefix) => {
    let engine = ossMaps[localEnv.oss].action()
    let uploadAction = engine['upload']
    let refreshdAction = engine['refresh']

    files.reduce((result, item) => {
      return result.then(() => {
        return new Promise(resolve => {
          if (!oss.isRefresh(item)) {
            resolve()
          } else {
            uploadAction(item, removePrefix)
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
}

module.exports = {
  deploy: (dir, force, removePrefix) => {
    let files = oss.files(dir)
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

    Helper.msg(`目标云存储：【${ossMaps[localEnv.oss].name}】  目标 bucket：【${config.bucket}】`)

    if (force) {
      oss.syncFiles(files, removePrefix)
    } else {
      Helper.msg('你即将同步的文件是：')
      files.forEach(item => {
        console.log(` ${item.split(`${process.cwd()}`)[1].slice(1)}`.grey)
      })
      rl.question('\r\n开始同步？（y / n）: '.red, (answer) => {
        rl.close()
        if (answer.toLocaleLowerCase() === 'y') {
          oss.syncFiles(files, removePrefix)
        }
      })
    }
  }
}
