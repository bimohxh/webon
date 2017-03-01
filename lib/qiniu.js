var qiniu = require('qiniu')
var Helper = require('./helper')
var request = require('request')
var querystring = require('querystring')

var localEnv = Helper.readLocalEnv()


qiniu.conf.ACCESS_KEY = localEnv.qiniu.accessKey
qiniu.conf.SECRET_KEY = localEnv.qiniu.secretKey

let bucket = localEnv.qiniu.bucket

var qn = {

  // 构建上传策略函数
  uptoken: (bucket, key) => {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ':' + key)
    return putPolicy.token()
  },

  // 普通上传
  upload: (file) => {
    let fullname = Helper.uploadFileName(file)
    return new Promise(resolve => {
      let uptoken = qn.uptoken(bucket, fullname)
      var extra = new qiniu.io.PutExtra()
      qiniu.io.putFile(uptoken, fullname, file, extra, (err, ret) => {
        if (!err) {
          resolve()
        } else {
          Helper.msg(err.error, 'error')
          resolve()
        }
      })
    })
  },

  // 刷新文件缓存
  refresh: (file) => {
    let urls = [localEnv.qiniu.baseurl + '/' + file]
    let url = 'http://fusion.qiniuapi.com/v2/tune/refresh'
    let data = querystring.stringify({
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
