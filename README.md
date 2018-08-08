# Antarest SQL
Simple REST factory with sequelizejs. Antarest will simply generate your GET, POST, PATCH, DELETE rest endpoint and other functionality without pain.

__v0.0.1__: 
- Initial release

__v0.0.2__: 
- Add query attribute in /query route
- Update documentation for /query

__v0.0.4__:
 - Create antarest with object parameter

## Installation
```npm install antarest-sql```

## Usage
``` javascript
antarest({ CONNECTION, ARRAY_OF_SERVICE_OBJ, OPTIONS })
```

`CONNECTION`: Your database object or URI

`ARRAY_OF_SERVICE_OBJ`: Your service object

`OPTIONS`: Antarest option

``` javascript
[
  { 
    path: '/cat', // path used as endpoint
    model: {
      name: 'Cat', // model name
      schema: {  // database object
        name: Sequelize.TEXT,
        weight: Sequelize.INTEGER
      },
      options: {}
    }
  }
]
```

Above usage will return express object and can be directly used with app.use()

``` javascript
var myRest = antarest({ CONNECTION, ARRAY_OF_SERVICE_OBJ, OPTIONS })

app.use(myRest)
```

## Example
Simple usage
``` javascript
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
```

Every antarest instantiation will generate this endpoint for you:
### __localhost:6969/cat/ - GET__
Endpoint for get all doc from database.

Example, return all docs:
```
GET localhost:6969/cat
```
result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "id": 1,
      "name": "Thomas The Cat",
      "weight": 2
    },
    {
      "id": 2,
      "name": "Fluff The Cat",
      "weight": 5
    },
    {
      "id": 3,
      "name": "Muff The Cat",
      "weight": 2,
    }
  ],
  "msg": "Return all payload that match filter",
  "query": {}
}
```

Example with query string:
```
GET localhost:6969/cat?name=Thomas+The+Cat
```
Result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "id": 1,
      "name": "Thomas The Cat",
      "weight": 2
    }
  ],
  "msg": "Return all payload that match filter",
  "query": {
    "name": "Thomas The Cat"
  }
}
```

For now, the query key must be same with the field in the database schema.

Query string only capable to do equal operator. For more complex operation refer to /search

### __localhost:6969/cat/search - POST__
Endpoint to get all docs given conditions in body request.

__Request body must be in 'application/json' format.__
Set 'Content-Type' header to application/json

`Content-Type: application/json`

Example:

```
POST localhost:6969/cat/search
```

```
Content-Type: application/json
```

``` json
{ "name": { "$eq": "Thomas The Cat" } }
```

The body request object refer to this operators documentation [http://docs.sequelizejs.com/manual/tutorial/querying.html#operators](). You can build your complex query, including limit and grouping, based on the documentation and send them as json to get your docs properly. Make sure that your conditions query match with your SQL version running.

Result:
``` json
{
  "status": 200,
  "payload": [      
    {
      "id": 1,
      "name": "Thomas The Cat",
      "weight": 2
    }
  ],
  "msg": "Return all payload that match filter",
  "query": {
      "name": {
        "$eq": "Thomas The Cat"
      }
    }
}
```

### __localhost:6969/cat/ - POST__
Create new doc.

Example:
```
POST localhost:6969/cat
```

``` json
{
  "name": "Puff The Cat",
  "weight": 9
}
```

Result:
``` json
{
    "status": 201,
    "payload": {
        "id": 4,
        "name": "Puff The Cat",
        "weight": 9
    },
    "msg": "Created"
}
```

### __localhost:6969/cat/ - PATCH__
Patch __single or multiple__ docs given conditions

Example:
```
PATCH localhost:6969/cat
```

conditions
``` json
{
  "conditions": { "id": { "$eq": 4 } },
  "patch": { "weight": 3 }
}
```

Result:
``` json
{
  "status": 200,
  "payload": [
    {
      "id": 4,
      "name": "Puff The Cat",
      "weight": 3
    }
  ],
  "msg": "All docs updated",
  "query": {
    "id": 4
  }
}
```


__WARNING__: It is important for you to make sure you pass your conditions. If you pass an empty object all docs will be updated.

### __localhost:6969/cat/ - DELETE__
Delete __single or multiple__ docs given conditions

Example:
```
DELETE localhost:6969/cat
```

conditions
``` json
{
  "conditions": { "weight": { "$gt": 3 } }  
}
```

Result:
``` json
{
  "status": 200,
  "payload": [
    {
      "id": 2,
      "name": "Fluff The Cat",
      "weight": 5
    }
  ],
  "msg": "All docs match deleted",
  "query": {
    "weight": {
      "$gt": 3
    }
  }
}
```

__WARNING__: It is important for you to make sure you pass your conditions. If you pass an empty object all docs will be deleted.

### __localhost:6969/cat/query - POST__
Run your custom SQL query

Example:
```
POST localhost:6969/cat/query
```

conditions
``` json
{
  "query": "SELECT * FROM Cats WHERE id=2"  
}
```

Result:
``` json
{
  "status": 200,
  "payload": [
    {
      "id": 2,
      "name": "Fluff The Cat",
      "weight": 5
    }
  ],
  "msg": "Succeed",
  "query": "SELECT * FROM Cats WHERE id=2"
}
```

## Options
`NotFoundHandler`: __false__, Add 404 handler

## Multiple Antarest Use
You can using antarest with multiple SQL database connection as you want.

Example:
``` javascript
...
var Cat = { name: Sequelize.TEXT, weight: Sequelize.INTEGER }
var Dog = { name: Sequelize.TEXT, weight: Sequelize.INTEGER }

app.use(
  antarest(
    'sqlite://cat.sqlite', {}, 
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

app.use(
  antarest(
    'sqlite://dog.sqlite', {}, 
    [
      { 
        path: '/dog', 
        model: {
          name: 'Dog',
          schema: Dog
        }
      }
    ], 
    { NotFoundHandler: true }
  )
)
...
```

Antarest will separate the connection so you will use all your SQL database connection.

## License
MIT
