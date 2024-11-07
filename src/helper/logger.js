const winston = require('winston');

// Create a custom log format to colorize error and info messages
const customFormat = winston.format.combine(
    winston.format.colorize({ all: true }),  // Enable colorizing for all levels
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, user_id, method }) => {
        const userId = `[\x1b[34mUSER_ID\x1b[0m: ${user_id || 'unknown'}]`;
        const methodName = `[\x1b[34mMETHOD\x1b[0m: ${method}]`;
        return `${timestamp} ${userId} ${methodName} [${level}]: ${message}`;
    })
);

// Create a logger instance
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: customFormat
        }),
        new winston.transports.File({ filename: 'src/logs/info.log', level: 'info' }),
        new winston.transports.File({ filename: 'src/logs/errors.log', level: 'error' })
    ]
});

module.exports = logger;

