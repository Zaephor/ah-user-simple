// Compound Action with Shared Inputs//
const validator = require('validator')
const { Action, api } = require('actionhero')

exports.UserRegister = class UserRegister extends Action {
  constructor () {
    super()
    this.name = 'user:register'
    this.version = 1
    this.description = 'New user registration'
    this.tags = ['auth']
    this.middleware = ['auth:logged_out']
    this.inputs = {
      domain: {
        default: (param, connection) => {
          if (api.config['ah-user-simple'].domain.enabled !== true) {
            return undefined
          }
          let domain
          // Auto add the requesting domain
          // TODO: Test if this is a valid approach, and how to handle socket and websocket
          if (connection.connection.type === 'web') {
            domain = connection.connection.rawConnection.req.headers.host.split(':')[0]
          }
          return domain
        },
        formatter: (param, connection, actionTemplate) => {
          return ('' + param).toLowerCase()
        },
        validator: (param, connection, actionTemplate) => {
          if (param && api.config['ah-user-simple'].domain.enabled !== true) { throw new Error('Domain scoped users are disabled.') }
        },
        required: false
      },
      email: {
        formatter: (param, connection, actionTemplate) => {
          return ('' + param).toLowerCase()
        },
        validator: (param, connection, actionTemplate) => {
          if (param && api.config['ah-user-simple'].localAuth.register !== true) { throw new Error('Local registration has been disabled.') }
          if (!validator.isEmail(param)) { throw new Error('Email format is invalid.') }
        },
        required: true
      },
      password: {
        validator: (param, connection, actionTemplate) => {
          if (param.length < 8) { throw new Error('Password length too short.') }
          if (param.length > 50) { throw new Error('Password length too long.') }
        },
        required: true
      }
    }
  }

  async run (data) {
    data.response.success = false
    let result
    try {
      result = await api.models.user.query().insert({
        domain: data.params.domain,
        email: data.params.email,
        password: data.params.password
      })
    } catch (e) {
      if (e.errno === 19) {
        api.log({ e }, 'debug')
        data.response.error = 'User could not be created.'
      } else {
        data.response.error = e // TODO: set better error language
      }
    }
    if (result && result.uuid && validator.isUUID(result.uuid)) {
      data.response.success = true
    }
  }
}

exports.UserLogin = class UserLogin extends Action {
  constructor () {
    super()
    this.name = 'user:login'
    this.version = 1
    this.description = 'User login'
    this.tags = ['auth']
    this.middleware = ['auth:logged_out']
    this.inputs = {
      domain: {
        default: (param, connection) => {
          if (api.config['ah-user-simple'].domain.enabled !== true) {
            return undefined
          }
          let domain
          // Auto add the requesting domain
          // TODO: Test if this is a valid approach, and how to handle socket and websocket
          if (connection.connection.type === 'web') {
            domain = connection.connection.rawConnection.req.headers.host.split(':')[0]
          }
          return domain
        },
        formatter: (param, connection, actionTemplate) => {
          return ('' + param).toLowerCase()
        },
        validator: (param, connection, actionTemplate) => {
          if (param && api.config['ah-user-simple'].domain.enabled !== true) { throw new Error('Domain scoped users are disabled.') }
        },
        required: false
      },
      email: {
        formatter: (param, connection, actionTemplate) => {
          return ('' + param).toLowerCase()
        },
        validator: (param, connection, actionTemplate) => {
          if (param && api.config['ah-user-simple'].localAuth.login !== true) { throw new Error('Local login has been disabled.') }
          if (!validator.isEmail(param)) { throw new Error('Email format is invalid.') }
        },
        required: true
      },
      password: {
        required: true
      }
    }
  }

  async run (data) {
    data.response.success = false
    let result
    try {
      const search = { email: data.params.email }
      if (data.params.domain) { search.domain = data.params.domain }
      result = await api.models.user.query().where(search).limit(1).first()
      if (!result.email || result.email !== data.params.email || !validator.isUUID(result.uuid) || !(await result.verifyPassword(data.params.password))) {
        throw new Error('Credentials invalid.')
      } else {
        const userSession = await api.session.create(data.connection, { method: 'ah-user-simple', id: result.uuid }) // Create a new user session, middleware will load this globally as data.session
        data.response.session = userSession
        data.response.success = true
      }
    } catch (e) {
      data.response.error = e // TODO: set better error language
    }
  }
}
