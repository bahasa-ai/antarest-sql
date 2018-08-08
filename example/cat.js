var express = require('express')
var Sequelize = require('sequelize')
var bodyParser = require('body-parser')

var antarest = require('../lib/antarestSql')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var Cat = { name: Sequelize.TEXT, weight: Sequelize.INTEGER }

app.use(
  antarest({
    connection: {
      uri: 'sqlite://cat.sqlite',
      options: {}
    },
    //  -- or using connection object
    // connection: {
    //   database: '',
    //   username: '',
    //   password: '',
    //   options: {
    //     dialect: 'sqlite',
    //     storage: 'cat.sqlite'
    //   }
    // },
    services: [
      {
        path: '/cat', 
        model: {
          name: 'Cat',
          schema: Cat,
          options: {}
        }
      }
    ],
    options: {
      NotFoundHandler: true
    }
  })
)

app.listen(6969)
