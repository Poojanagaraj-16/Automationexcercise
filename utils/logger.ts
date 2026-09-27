import winston from 'winston';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------
// LOG DIRECTORY
// ---------------------------------------------------------

const logDirectory = path.resolve('logs');

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

// ---------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logFormat = winston.format.printf((info) => {

    const scope = info.scope ? ` [${info.scope}]` : '';

    return `${info.timestamp} [${info.level}]${scope} ${info.message}`;
});

// ---------------------------------------------------------
// LOGGER
// ---------------------------------------------------------

export const logger = winston.createLogger({

    level: LOG_LEVEL,

    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        logFormat
    ),

    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            filename: path.join(logDirectory, 'combined.log')
        })
    ]
});

/**
 * Returns a logger that prefixes every message with the given scope
 * (e.g. the Page Object name) which makes the log file easy to filter.
 */
export function createLogger(scope: string): winston.Logger {
    return logger.child({ scope });
}

export type Logger = winston.Logger;

export default logger;
