exports.Ping = (req, res) => {
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