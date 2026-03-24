const winston = require('winston');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;

    // Add stack trace for errors
    if (stack) {
        msg += `\n${stack}`;
    }

    // Add metadata if present
    if (Object.keys(metadata).length > 0) {
        msg += ` ${JSON.stringify(metadata)}`;
    }

    return msg;
});

// Custom format for file output (JSON)
const fileFormat = combine(timestamp(), errors({ stack: true }), winston.format.json());

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), errors({ stack: true })),
    defaultMeta: { service: 'o-investigador-api' },
    transports: [
        // Console transport with colors (development)
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                consoleFormat
            )
        })
    ]
});

// Add file transports in production
if (process.env.NODE_ENV === 'production') {
    logger.add(
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
    logger.add(
        new winston.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    );
}

// Stream for Morgan (HTTP request logging)
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    }
};

// Helper methods that match console API for easier migration
logger.debug = logger.debug.bind(logger);
logger.info = logger.info.bind(logger);
logger.warn = logger.warn.bind(logger);
logger.error = logger.error.bind(logger);

module.exports = logger;
