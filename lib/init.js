const readline = require('readline')
const Helper = require('./helper')
const fs = require('fs')
const path = require('path')

var Init = {

  // 递归执行一个流程下的配置组
  configGroups: (confs, rl, data) => {
    return confs.reduce((result, item) => {
      return result.then(() => {
        return new Promise(resolve => {
          Helper.enter(rl, '\r\n' + item.name, data, item.key, item.val).then(() => {
            let realVal = data[item.key]
            if (item.subs && item.subs[realVal]) {
              data[realVal] = data[realVal] || {}
              Init.configGroups(item.subs[realVal], rl, data[realVal]).then(() => {
                resolve()
              })
            } else {
              resolve()
            }
          })
        })
      })
    }, Promise.resolve())
  },

  // 初始化配置的初始值
  setDefaulVal: (maps, baseEnv) => {
    if (Helper.hasLocalEnv()) {
      maps.forEach(item => {
        let exsist = baseEnv[item.key]
        if (exsist !== undefined) {
          item.val = exsist
        }

        if (item.subs) {
          for (let subKey in item.subs) {
            if (baseEnv[subKey]) {
              Init.setDefaulVal(item.subs[subKey], baseEnv[subKey])
            }
          }
        }
      })
    }
  }
}

module.exports = {
  config: () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    let filePath = path.resolve(process.cwd(), './webon.config.json')
    let env = Helper.readLocalEnv()

    let data = {}

    let maps = [
      {
        name: '网站运行端口',
        key: 'port',
        val: '3000'
      },
      {
        name: '要部署到哪个oss上面，目前支持七牛云<qiniu>和阿里云<aliyun>',
        key: 'oss',
        val: 'qiniu',
        subs: {
          qiniu: [
            {
              name: '七牛云 accessKey',
              key: 'accessKey'
            },
            {
              name: '七牛云 secretKey',
              key: 'secretKey'
            },
            {
              name: '七牛云 bucket',
              key: 'bucket'
            },
            {
              name: '绑定的域名，用于刷新缓存',
              key: 'baseurl'
            }
          ],
          aliyun: [
            {
              name: '阿里云OSS Access Key ID',
              key: 'accessKeyId'
            },
            {
              name: '阿里云OSS Access Key Secret',
              key: 'accessKeySecret'
            },
            {
              name: '阿里云OSS bucket',
              key: 'bucket'
            },
            {
              name: '区域编码',
              key: 'region'
            }
          ]
        }
      },
      {
        name: '不需要同步的文件，以逗号分隔',
        key: 'ignore',
        val: '*.log, *.log.json, *.config, *.config.json, .gitignore, README.md, .git*'
      },
      {
        name: '需要同步的文件（白名单，如果设置该项，则覆盖 ignore 配置），以逗号分隔',
        key: 'whitelist',
        val: ''
      }
    ]

    Init.setDefaulVal(maps, env)
    Init.configGroups(maps, rl, data)
    .then(() => {
      // 写文件
      fs.writeFile(filePath, JSON.stringify(data), 'utf8', () => {
        Helper.msg('写入配置文件成功！')
        Helper.msg(`配置文件的存放地址为：${filePath}，你也可以手动对其进行修改。\r\n 别忘了将 webon.config.json 加入到 gitignore 中`, 'input')
        rl.close()
      })
    })
  },
  viewConfig: () => {
    let env = Helper.readLocalEnv()
    Helper.msg(JSON.stringify(env), 'prompt')
  }
}
