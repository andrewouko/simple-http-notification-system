// const { validateList, validateAddToCart, validateFilter, validateRemoveItemFromCart } = require('./validators.js');

const { createSubsription, publishMessage } = require('./controllers/publisher.js');

const { ErrorHandler, handleError } = require('./error.js');

const errorHandlingRoute = function(req, res, next) {
    let err =  new ErrorHandler(404, `The requested route: ${req.originalUrl} could not be found`, req.params)
    return handleError(err, res)
}

const routes = app => {
    const { Ping, Health } = require('./controllers/system.js');
    // health check
    app.route('/health').get(Health)
    // status check
    app.route('/status').get(Ping)


    // create subscription
    app.route('/subscribe/:topic').post(createSubsription)

    // publish message to topic 
    app.route('/publish/:topic').post(publishMessage)
};

module.exports = {
    errorHandlingRoute,
    routes
}