const { run } = require('runjs')
const chalk = require('chalk')
const config = require('../vue.config.js')
const rawArgv = process.argv.slice(2)
const args = rawArgv.join(' ')

if (process.env.npm_config_preview || rawArgv.includes('--preview')) {
  const report = rawArgv.includes('--report')

  run(`vue-cli-service build ${args}`)

  const port = 8080
  const publicPath = config.publicPath

  var connect = require('connect')
  var serveStatic = require('serve-static')
  const app = connect()

  app.use(
    publicPath,
    serveStatic('./dist', {
      index: ['index.html', '/']
    })
  )

  app.listen(port, function () {
//  console.log(chalk.green(`> Preview at  http://192.168.1.103:${port}${publicPath}`)) //开发环境、
//  console.log(chalk.green(`> Preview at  http://120.77.233.206:${port}${publicPath}`)) //线上环境
    if (report) {
//    console.log(chalk.green(`> Report at  http://192.168.1.103:${port}${publicPath}report.html`))//开发环境
//    console.log(chalk.green(`> Report at  http://120.77.233.206:${port}${publicPath}report.html`))//线上环境
      
    }

  })
} else {
  run(`vue-cli-service build ${args}`)
}
