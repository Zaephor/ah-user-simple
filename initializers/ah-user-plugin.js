// Duplicated and derived from https://github.com/actionhero/actionhero-angular-bootstrap-cors-csrf/blob/master/initializers/session.js
'use strict'
const { Initializer, api } = require('actionhero')
const path = require('path')

module.exports = class sessionInitializer extends Initializer {
  constructor () {
    super()
    this.name = 'ah-user-simple'
    this.loadPriority = 1003
    this.startPriority = 1003
    this.stopPriority = 1003
  }

  async initialize () {
    if (api.config && !api.config[this.name]) {
      api.config[this.name] = require(path.join(api.config.plugins[this.name].path, 'config', this.name + '.js'))[process.env.NODE_ENV || 'default'][this.name](api)
    }
    const config = api.config[this.name]

    api.log('[' + this.loadPriority + '] ' + this.name + ': Initializing')

    if (api.auth && api.auth.plugins) {
      api.auth.plugins[this.name].lookup = async function (userid) {
        return JSON.parse(JSON.stringify(await api.models.user.query().where('uuid', userid).limit(1).first()))
      }
    }

    if (config.localAuth.register === true) {
      api.routes.registerRoute('post', '/user/register', 'user:register')
    }
    if (config.localAuth.login === true) {
      api.routes.registerRoute('post', '/user/login', 'user:login')
    }
  }
}
