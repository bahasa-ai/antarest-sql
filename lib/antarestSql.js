var express = require('express')
var RouterFactory = require('./RouterFactory')
var Sequelize = require('sequelize')

/**
 * @param {object} params - object of connection, services, and options
 */
function Antarest(params) {
  let { connection, services, options } = params
  
  // connect to SQL
  let sequelize
  if (typeof(connection) === 'object' && connection.constructor.name === 'Sequelize') {
    sequelize = connection
  } else if (connection.uri) {
    sequelize = new Sequelize(connection.uri, connection.options || {})
  } else if (connection.database != undefined && connection.username != undefined && connection.password != undefined) {
    sequelize = new Sequelize(connection.database, connection.username, connection.password, connection.options || {})
  } else {
    throw new TypeError('connection attribute must be defined.')
  }

  var app = express()

  /** Options
   *  
   * [NotFoundHandler]: false
  */
  var Options = (typeof options !== 'object' || options.constructor.name !== 'Object') ? {} : options  

  // define and assign each of service in specification
  services.map(s => {
    let model
    if (typeof(s.model) === 'function' && s.model.constructor.name === 'Function') {
      model = s.model
    } else if (s.model.name && s.model.schema) {
      model = sequelize.define(s.model.name, s.model.schema, s.model.options)
    } else {
      throw new TypeError('model needs a Sequelize.Model or object with name, schema attributes.')
    }

    // assign all router to specific path
    app.use(s.path, RouterFactory(model, sequelize))
  })

  sequelize.sync(Options.Sync || {})

  // Assign NotFoundHandler to express
  Options.NotFoundHandler && app.use(function(req, res) { res.send({ status: 404, msg: 'Service not found' }) })

  return app
}

function ModelBuilder(model) {
  
}

module.exports = Antarest
