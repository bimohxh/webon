var qiniu = require('qiniu')
var Helper = require('./helper')
var path = require('path')
var request = require('request')
var querystring = require('querystring')
var fs = require('fs')

var localEnv = Helper.readLocalEnv()


qiniu.conf.ACCESS_KEY = localEnv.qiniu.accessKey
qiniu.conf.SECRET_KEY = localEnv.qiniu.secretKey

let bucket = localEnv.qiniu.bucket

let getFullName = (file) => {
  var approot = path.resolve(path.dirname(__dirname), process.cwd()) + '/'
  return file.split(approot)[1]
}

var qn = {

  // 构建上传策略函数
  uptoken: (bucket, key) => {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ':' + key)
    return putPolicy.token()
  },

  // 普通上传
  upload: (file) => {
    let fullname = getFullName(file)
    let uptoken = qn.uptoken(bucket, fullname)
    var extra = new qiniu.io.PutExtra()
    return new Promise(resolve => {
      qiniu.io.putFile(uptoken, fullname, file, extra, (err, ret) => {
        if (!err) {
          qn.recordHash(fullname, ret.hash).then(isRefresh => {
            console.log(`同步文件${isRefresh ? '并刷新缓存' : ''}成功：${fullname}`.grey)
            resolve()
          })
        } else {
          Helper.msg(err.error, 'error')
          resolve()
        }
      })
    })
  },

  // 记录文件的hash值
  recordHash: (file, hash) => {
    let filename = path.resolve(process.cwd(), './qiniu.log.json')
    return new Promise(resolve => {
      try {
        let hashs = require(filename)
        if (hashs[file] && hashs[file] !== hash) {
          hashs[file] = hash
          qn.refresh([localEnv.qiniu.baseurl + '/' + file]).then(() => {
            fs.writeFileSync(filename, JSON.stringify(hashs))
            resolve(true)
          })
        } else {
          resolve(false)
        }
      } catch (ex) {
        let tmp = {}
        tmp[file] = hash
        fs.writeFileSync(filename, JSON.stringify(tmp))
        resolve(false)
      }
    })
  },

  // 刷新文件缓存
  refresh: (urls) => {
    let url = 'http://fusion.qiniuapi.com/v2/tune/refresh'
    let data = querystring.stringify({
      // urls: ['http://olep9wahr.bkt.clouddn.com/index.html']
      urls: urls
    })
    return new Promise(resolve => {
      let token = qiniu.util.generateAccessToken(url, data)
      request({
        method: 'POST',
        url: url,
        form: data,
        headers: {
          'Authorization': token
        }
      }, (error, response, body) => {
        if (error) {
          Helper.msg(error, 'error')
        }
        resolve()
      })
    })
  }
}

module.exports = qn
