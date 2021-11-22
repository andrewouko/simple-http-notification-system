const { logger } = require('./logger')
var expressWinston = require('express-winston');
const { transports, /* format */} = require('winston');
const { handleError } = require('./error');
// const { timestamp } = format;
const entryMiddleware = app => {
    app.use((req, res, next) => {
        process.env.TZ = 'Africa/Nairobi'
        logger.info('Request IP:' + JSON.stringify({
            ip: req.ip,
            ips: req.ips
        }))
        logger.info('Request Time: ' + new Date().toISOString()),
        logger.info('Request Method: ' + req.method),
        logger.info('Request URI:' + JSON.stringify({
            baseUrl: req.baseUrl,
            // cookies: req.cookies,
            fresh: req.fresh,
            host: req.headers.host,
            hostname: req.hostname,
            originalUrl: req.originalUrl,
            params: req.params,
            path: req.path,
            protocol: req.protocol,
            query: req.query,
            subdomains: req.subdomains,
            xhr: req.xhr,
            full_url: req.protocol + '://' + (req.subdomains.length ? req.subdomains.join('.') + '.' : '') + req.headers.host + req.originalUrl
        }))
        logger.info('Request Headers: ' + JSON.stringify(req.headers))
        logger.info('Request Body: ' + JSON.stringify(req.body))
        logger.info('Request Cookies: ' + req.cookies)
        next()
    })
}
const errorHandlingMiddleware = app => {
    app.use((err, req, res, next) => {
        handleError(err, res)
    })
}
const exitMiddleware = app => {
    expressWinston.responseWhitelist.push('body');
    // const label = process.env.APP_NAME || 'API Name'
    app.use(expressWinston.logger({
        transports: [
            new transports.Console(),
            new transports.File({ filename: `${process.env.APP_NAME}.log` }),
        ],
        // msg: `${timestamp()}: [${label}] Response Info: ${res}`,
        meta: true, // optional: control whether you want to log the meta data about the request (default to true)
        expressFormat: true, // Use the default Express/morgan request formatting, with the same colors. Enabling this will override any msg and colorStatus if true. Will only output colors on transports with colorize set to true
        colorStatus: true, // Color the status code, using the Express/morgan color palette (default green, 3XX cyan, 4XX yellow, 5XX red). Will not be recognized if expressFormat is true
    }));
}
module.exports = {
    entryMiddleware,
    errorHandlingMiddleware,
    exitMiddleware
}