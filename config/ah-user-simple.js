'use strict'

exports.default = {
  'ah-user-simple': (api) => {
    return {
      // domain: domain-scoped authentication
      domain: {
        enabled: true
      },
      // localAuth: localized authentication
      localAuth: {
        register: true,
        login: true
      }
    }
  }
}

exports.test = {
  'ah-user-simple': (api) => {
    return {
      // domain: domain-scoped authentication
      domain: {
        enabled: true
      },
      // localAuth: localized authentication
      localAuth: {
        register: true,
        login: true
      }
    }
  }
}
