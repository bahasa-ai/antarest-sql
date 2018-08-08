var express = require('express')
var RouterFactory = require('./RouterFactory')
var Sequelize = require('sequelize')

/**
 * @param {Array} services - Array of services, [{path: String, model: mongoose.Model}]
 * @param {{ [key]: value }} options 
 */
function Antarest(connectURI, connectOptions, services, options) {  
  // connect to mongoDB
  var sequelize = new Sequelize(connectURI, connectOptions || {})
  
  var app = express()
  
  /** Options
   *  
   * [NotFoundHandler]: false
  */
  var Options = (typeof options !== 'object' || options.constructor.name !== 'Object') ? {} : options  

  // define and assign each of service in specification
  services.forEach(s => {
    var model = sequelize.define(s.model.name, s.model.schema, s.model.options)

    // assign all router to specific path
    app.use(s.path, RouterFactory(model, sequelize))
  })

  // Assign NotFoundHandler to express
  Options.NotFoundHandler && app.use(function(req, res) { res.send({ status: 404, msg: 'Service not found' }) })
  
  return app
}

module.exports = Antarest
