import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'medivault-backend' },
  transports: [
    new winston.transports.Console({
      silent: process.env.NODE_ENV === 'test' && !process.env.DEBUG_TESTS
    })
  ]
});
