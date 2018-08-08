var express = require('express')
var Sequelize = require('sequelize')
var bodyParser = require('body-parser')

var antarest = require('../lib/antarestSql')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

let sequelize = new Sequelize('sqlite://cat.sqlite')
//  -- or
// let sequelize = new Sequelize('database', 'username', 'password', { dialect: 'somethingSQL' })

let cat = sequelize.define('Cat', { name: Sequelize.TEXT, weight: Sequelize.INTEGER })
let dog = sequelize.define('Dog', { name: Sequelize.TEXT, weight: Sequelize.INTEGER })

cat.belongsTo(dog)

app.use(
  antarest({
    connection: sequelize,
    services: [
      {
        path: '/cat', 
        model: cat
      },
      {
        path: '/dog', 
        model: dog
      }
    ],
    options: {
      NotFoundHandler: true,
      Sync: {
        force: true
      }
    }
  })
)

app.listen(6969)
