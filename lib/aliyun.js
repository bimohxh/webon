var OSS = require('ali-oss')
var Helper = require('./helper')

var localEnv = Helper.readLocalEnv()


const fetchConfVal = (str) => {
  let matchs = str.match(/^<(.+)>$/) 
  return matchs ? process.env[matchs[1]] : str
}

var client = new OSS.Wrapper({
  region: localEnv.aliyun.region,
  accessKeyId: fetchConfVal(localEnv.aliyun.accessKeyId),
  accessKeySecret: fetchConfVal(localEnv.aliyun.accessKeySecret)
})

var aliyun = {
  // 上传
  upload: (file, removePrefix) => {
    return new Promise(resolve => {
      let fullname = Helper.uploadFileName(file, removePrefix)
      client.useBucket(localEnv.aliyun.bucket)
      client.put(fullname, file).then((data) => {
        resolve()
      })
    })
  }
}


module.exports = aliyun
