const readline = require('readline')
const Helper = require('./helper')
const fs = require('fs')
const path = require('path')

module.exports = {
  config: () => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    let filePath = path.resolve(path.dirname(__dirname), 'config/local_env.json')
    console.log('配置文件地址是：' + filePath)
    let env = Helper.readLocalEnv()

    let data = {}

    let maps = [
      {
        name: 'API根路径',
        key: 'base_url',
        val: 'http://192.168.1.120/openapi/api/1.0/'
      },
      {
        name: 'App Key',
        key: 'app_key'
      },
      {
        name: 'App Id',
        key: 'app_id'
      },
      {
        name: 'Token',
        key: 'token'
      }
    ]

    // 读取已有的配置
    if (env.API) {
      for (let key in env.API) {
        let item = maps.find(item => { return item.key === key })
        if (item) {
          item.val = env.API[key]
        }
      }
    }

    maps.reduce((result, item) => {
      return result.then(() => {
        return Helper.enter(rl, item.name, data, item.key, item.val)
      })
    }, Promise.resolve())
    .then(() => {
      for (let key in data) {
        if (data[key].trim() === '') {
          data[key] = maps.find(item => { return item.key === key }).val
        }

        if (data[key] === undefined) {
          data[key] = ''
        }
      }

      let APIConfig = {
        API: data
      }

      console.log(JSON.stringify(APIConfig))
      // 写文件
      fs.writeFile(filePath, JSON.stringify(APIConfig), 'utf8', () => {
        Helper.msg('写入配置文件成功！')
        rl.close()
      })
    })
  },
  viewConfig: () => {
    let env = Helper.readLocalEnv()
    Helper.msg(JSON.stringify(env), 'prompt')
  }
}