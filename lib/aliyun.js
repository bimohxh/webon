var OSS = require('ali-oss')
var Helper = require('./helper')

const fetchConfVal = (str) => {
  let matchs = str.match(/^<(.+)>$/) 
  return matchs ? process.env[matchs[1]] : str
}

var client;

var aliyun = {
  // 
  init(localEnv) {
    client = new OSS.Wrapper({
      region: localEnv.aliyun.region,
      accessKeyId: fetchConfVal(localEnv.aliyun.accessKeyId),
      accessKeySecret: fetchConfVal(localEnv.aliyun.accessKeySecret)
    })
    client.useBucket(localEnv.aliyun.bucket)
  },
  // 上传
  upload: (file, removePrefix) => {
    return new Promise(resolve => {
      let fullname = Helper.uploadFileName(file, removePrefix)
      client.put(fullname, file).then((data) => {
        resolve()
      })
    })
  }
}


module.exports = aliyun
