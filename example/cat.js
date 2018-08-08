var express = require('express')
var Sequelize = require('sequelize')
var bodyParser = require('body-parser')

var antarest = require('../lib/antarestSql')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var Cat = { name: Sequelize.TEXT, weight: Sequelize.INTEGER }

app.use(
  antarest(
    'sqlite://cat.sqlite', 
    {}, 
    [
      { 
        path: '/cat', 
        model: {
          name: 'Cat',
          schema: Cat,
          options: {}
        }
      }
    ]
  )
)

app.listen(6969)
