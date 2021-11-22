var express = require('express')
require('dotenv').config()
const cors = require('cors');


const app = express();

app.use(cors())

const router = express.Router();

// parse requests of content-type: application/json
app.use(express.json());

// register middleware
const { entryMiddleware, errorHandlingMiddleware, exitMiddleware , } = require('./middleware.js');

// entry middleware to log all HTTP Requests
entryMiddleware(app)
// exit middleware to log all HTTP Responses
exitMiddleware(app)

// register routes
var routes = require('./routes.js');
const { ErrorHandler, handleError } = require('./error.js');
routes(app)

// generic error handler
errorHandlingMiddleware(app)

// Handle 404
app.use(function(req, res, next) {
    let err =  new ErrorHandler(404, 'The requested route could not be found', req.params)
    return handleError(err, res)
});

// set port, listen for requests
const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(process.env.APP_NAME + " is running on port " + port);
})