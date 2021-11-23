// const { validateList, validateAddToCart, validateFilter, validateRemoveItemFromCart } = require('./validators.js');

const { createSubsription, publishMessage } = require('./controllers/publisher.js');

module.exports = app => {
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