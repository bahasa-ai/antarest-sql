var express = require('express')
var Sequelize = require('sequelize')

function Router(model, sequelize) {
  var router = express.Router()
  var Model = model

  function _parseConditions(conditions) {
    if (typeof conditions !== 'object' || conditions.constructor.name !== 'Object') return conditions

    var results = {}
    Object.keys(conditions).forEach(function(e) {
      var e1 = e
      if (e1[0] == '$') {
        e1 = Sequelize.Op[e1.substr(1)]
      }
      results[e1] = _parseConditions(conditions[e])
    })
    return results
  }

  /**
   * _find
   * Return all docs match with the conditions
   *
   * @param {*} conditions
   */
  function _find(conditions) {
    return Model.findAll({
      where: _parseConditions(conditions)
    })
      .then(function(docs) {
        const docsIsEmpty = docs.length === 0

        return {
          status: (!docsIsEmpty) ? 200 : 404,
          payload: (!docsIsEmpty) ? docs : [],
          msg: (!docsIsEmpty) ? 'Return all payload that match filter' : 'No docs found',
          query: conditions
        }
      })
      .catch(function(err) {
        return { status: 400, msg: err, query: conditions }
      })
  }

  /**
   * GET - /[model_path]/
   * Get all docs or single docs given filter
   */
  router.get('/', function(req, res, next) {
    var conditions = {}

    Object.keys(req.query).map(q => conditions[q] = req.query[q])

    _find(conditions).then(r => res.send(r))
  })

  /**
   * POST - /[model_path]/search
   * Get all docs given the condition from body
   */
  router.post('/search', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    var conditions = req.body || {}

    _find(conditions).then(r => res.send(r))
  })

  /**
   * POST - /[model_path]/query
   * Run query from body request
   */
  router.post('/query', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    // check if body has the correct format to prevent deleting all docs
    if (!req.body.hasOwnProperty('query')) {
      return res.send({ status: 400, msg: 'Bad Request' })
    }

    var query = req.body.query || {}
    sequelize.query(query)
      .then(function(docs) { return res.send({ status: 200, payload: docs[0], msg: 'Succeed', query: docs[1].sql }) })
      .catch(function(err) { return res.send({ status: 400, msg: err }) })
  })

  /**
   * POST - /[model_path]/
   * Create new data
   * Body from user must be in the same format with table Schema
   */
  router.post('/', function(req, res, next) {
    Model.create(req.body)
      .then(function(doc) { return res.send({ status: 201, payload: doc, msg: 'Created' }) })
      .catch(function(err) { return res.send({ status: 400, msg: err }) })
  })

  /**
   * DELETE - /[model_path]/
   * Hard-delete agent data given query
   */
  router.delete('/', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    // check if body has the correct format to prevent deleting all docs
    if (!req.body.hasOwnProperty('conditions')) {
      return res.send({ status: 400, msg: 'Bad Request' })
    }

    var conditions = req.body.conditions || {}

    // get all matched docs
    _find(conditions)
      .then(function(r) {
        Model.destroy({ where: _parseConditions(conditions) })
          .then(function(doc) {
            return res.send(r)
          })
          .catch(function(err) {
            return res.send({ status: 400, msg: err })
          })
      })
      .catch(function(err) {
        return res.send({ status: 400, msg: err })
      })
  })

  /**
   * PATCH - /[model]/
   * Update data given query
   * Body from user must be in the same format with table Schema
   */
  router.patch('/', function(req, res, next) {
    // payload must be in JSON format
    if (req.get('Content-Type') !== 'application/json') {
      return res.send({ status: 406, msg: 'Not Acceptable'})
    }

    // check if body has the correct format to prevent updating all docs
    if (!req.body.hasOwnProperty('conditions') || !req.body.hasOwnProperty('patch')) {
      return res.send({ status: 400, msg: 'Bad Request' })
    }

    var conditions = req.body.conditions || {}
    var patch = req.body.patch || {}

    _find(conditions)
      .then(function(r) {
        Model.update(patch, { where: _parseConditions(conditions) })
          .then(function(doc) {
            var data = r.payload.map(function(e) {
              return { ...e.dataValues, ...patch }
            })
            return res.send({ ...r, payload: data })
          })
          .catch(function(err) {
            return res.send({ status: 400, msg: err })
          })
      })
      .catch(function(err) {
        return res.send({ status: 400, msg: err })
      })
  })

  return router
}

module.exports = Router
