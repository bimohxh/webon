let Helper = require('./lib/helper')


Helper.walk(process.cwd(), false, 'node_modules, .git').forEach(item => {
  console.log(item)
})