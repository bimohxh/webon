const fs = require('fs')
const path = require('path')
const Helper = require('./helper')

let structure = [
  {
    folder: 'css',
    subs: [
      {
        file: '.keep'
      }
    ]
  },
  {
    folder: 'img',
    subs: [
      {
        file: '.keep'
      }
    ]
  },
  {
    folder: 'js',
    subs: [
      {
        file: '.keep'
      }
    ]
  },
  {
    folder: 'svg',
    subs: [
      {
        file: '.keep'
      }
    ]
  },
  {
    file: '.gitignore',
    con: `*.config.json`
  },
  {
    file: 'index.html',
    con: `<!DOCTYPE html>
<html>
  <head>
    <title>Home</title>
    <meta charset="utf-8" />
    
    <!--<link href="" rel="stylesheet">-->
  </head>
  
  <body>
    
    <!--<script src=""></script>-->
  </body>
</html>   
`
  }
]

let app = {
  create: (parent, item) => {
    let filepath = path.resolve(parent, item.folder || item.file)
    let relativePath = filepath.split(process.cwd() + '/')[1]
    if (item.folder) {
      fs.mkdirSync(filepath)
      console.log(` + ${relativePath}`.grey);
      (item.subs || []).forEach(sub => {
        app.create(filepath, sub)
      })
    } else {
      fs.writeFile(path.resolve(parent, filepath), item.con || '')
      console.log(` + ${relativePath}`.grey)
    }
  }
}



module.exports = {
  new: (dir) => {
    let rootPath = path.resolve(process.cwd(), dir)
    fs.stat(rootPath, (err, stats) => {
      if (!err && stats.isDirectory()) {
        Helper.msg(`当前目录已经存在名为 ${dir} 的文件夹`, 'error')
        return
      }

      Helper.msg('开始创建项目结构')

      fs.mkdirSync(rootPath)

      structure.forEach(item => {
        app.create(rootPath, item)
      })

      Helper.msg('创建项目成功！')
    })
  }
}
