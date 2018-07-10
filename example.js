var express = require('express')
var Sequelize = require('sequelize')
var bodyParser = require('body-parser')

var antarest = require('./index')

var app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

var Cat = { name: Sequelize.TEXT, weight: Sequelize.INTEGER }
// var Dog = new mongoose.Schema({ name: String, weight: Number, birth: Date })

app.use(
  antarest(
    'sqlite:///home/mgilangjanuar/Documents/workspace/antares/antarest-sql/example.sqlite', 
    {}, 
    [
      { 
        path: '/cat', 
        model: {
          name: 'Cat',
          schema: Cat
        }
      }
    ]
  )
)

// app.use(
//   antarest(
//     'mongodb://localhost:27017/dogs', 
//     { promiseLibrary: global.Promise }, 
//     [
//       { 
//         path: '/dog', 
//         model: {
//           name: 'Dog',
//           schema: Dog,
//           collection: 'dogs'
//         }
//       }
//     ], 
//     { NotFoundHandler: true }
//   )
// )

app.listen(6969)