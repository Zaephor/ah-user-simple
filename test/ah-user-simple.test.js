/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
const fs = require('fs')
const path = require('path')
const { expect } = require('chai')
const ActionHero = require('actionhero')
const actionhero = new ActionHero.Process()

process.env.PROJECT_ROOT = path.join(require.resolve('actionhero'), '..')
const knexConfig = require(path.join(require.resolve('@zaephor-ah/ah-knex-plugin'), '..', 'config', 'ah-knex-plugin.js'))
const knexEnv = (process.env.NODE_ENV && knexConfig[process.env.NODE_ENV]) ? process.env.NODE_ENV : 'default'
const sessionConfig = require(path.join(require.resolve('@zaephor-ah/ah-session-plugin'), '..', 'config', 'ah-session-plugin.js'))
const sessionEnv = (process.env.NODE_ENV && sessionConfig[process.env.NODE_ENV]) ? process.env.NODE_ENV : 'default'
let api

describe('ah-user-simple', () => {
  const configChanges = {
    'ah-knex-plugin': knexConfig[knexEnv]['ah-knex-plugin'](ActionHero.api),
    'ah-session-plugin': sessionConfig[sessionEnv]['ah-session-plugin'](ActionHero.api),
    // 'ah-objection-plugin': config[environment]['ah-objection-plugin'](ActionHero.api),
    plugins: {
      'ah-session-plugin': { path: path.join(require.resolve('@zaephor-ah/ah-session-plugin'), '..') },
      'ah-knex-plugin': { path: path.join(require.resolve('@zaephor-ah/ah-knex-plugin'), '..') },
      'ah-objection-plugin': { path: path.join(require.resolve('@zaephor-ah/ah-objection-plugin'), '..') },
      'ah-auth-plugin': { path: path.join(require.resolve('@zaephor-ah/ah-auth-plugin'), '..') }
    }
  }

  before(async () => {
    if (!fs.existsSync('./public')) { fs.mkdirSync('./public') }
    if (!fs.existsSync('./public/javascript')) { fs.mkdirSync('./public/javascript') }
    api = await actionhero.start({ configChanges })
  })

  after(async () => {
    await actionhero.stop()
    if (fs.existsSync(configChanges['ah-knex-plugin'].connection.filename)) { fs.unlinkSync(configChanges['ah-knex-plugin'].connection.filename) }
  })

  // Generic actionhero started check
  it('ActionHero server launches', () => {
    expect(api.running).to.equal(true)
  })

  // Generic module loaded check
  const scopes = ['knex', 'objection', 'models', 'auth']
  for (const attribute of scopes) {
    it(attribute + ' should be in api scope', async () => {
      expect(api[attribute]).to.exist
    })
  }

  it('TODO: should validate the user migrations were loaded/run')
  it('TODO: should validate the user model was loaded')

  // Create and retrieve user check directly from model
  const dummyUser = { email: 'test@domain.com', password: 'password123' }
  it('create user entry', async () => {
    const newUserObject = await api.models.user.query().insert(dummyUser)
    expect(newUserObject.email).to.equal(dummyUser.email)
    expect(await newUserObject.verifyPassword(dummyUser.password)).to.equal(true)
    expect(newUserObject.uuid).to.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
    dummyUser.uuid = newUserObject.uuid
  })
  it('obtain user entry', async () => {
    const userObject = await api.models.user.query().where('email', dummyUser.email).limit(1).first()
    expect(userObject.email).to.equal(dummyUser.email)
    expect(await userObject.verifyPassword(dummyUser.password)).to.equal(true)
    expect(userObject.uuid).to.equal(dummyUser.uuid)
  })

  const actions = ['user:register', 'user:login']
  for (const attribute of actions) {
    it('TODO: validate that action ' + attribute + ' is functioning')
  }
  const routes = ['/user/register', '/user/login']
  for (const attribute of routes) {
    it('TODO: validate that route ' + attribute + ' is functioning')
  }

  it('TODO: validate that data.auth is false if no session')
  it('TODO: validate that data.auth is contains the user if theres a session')
})
