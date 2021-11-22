const { createLogger, format,  transports} = require('winston');
const { combine, timestamp, label, printf } = format;

const log_format = printf(({ level, message, label, timestamp }) => {
    return `${timestamp}: [${label}] ${level}: ${message}`;
});

const logger = createLogger({
    level: 'info',
    defaultMeta: { service: process.env.APP_NAME || 'API' },
    format: combine(
        // add filename in futue
        label({ label: process.env.APP_NAME || 'API Name'}),
        timestamp(),
        log_format
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: `${process.env.APP_NAME}.log` }),
    ]
});

module.exports = {
    logger: logger
}