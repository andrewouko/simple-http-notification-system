const { isEmpty } = require("lodash");
const { handleError, ErrorHandler } = require("../error");

exports.Ping = (req, res) => {
    let error
    const envNotSet = ['HOST', 'USER', 'PASSWORD', 'DB'].some(env_val => {
        if( isEmpty(process.env[env_val]) ) {
            error = new ErrorHandler(500, `The env file is misisng ${env_val} property`, null)
            return true
        }
        return
    })
    if(envNotSet) return handleError(error, res)
    const client_ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    return res.status(200).type('json').json({
        ip: client_ip, 
        health: 'Ok', 
        env: {
            port: process.env.PORT,
            app_name: process.env.APP_NAME
        }
    });
}
exports.Health = (req, res, next) => {
    return res.status(200).type('html').send('Ok')
}