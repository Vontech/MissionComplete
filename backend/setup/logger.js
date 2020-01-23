import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import * as fs from 'fs';
import config from './config';

const dir = config.logFileDir;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'test' ? [] : 'info',
  transports: [
    new winston.transports.Console({
        name: 'defaultLogger',
        format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
        }),
    new DailyRotateFile({
      filename: config.logFileName,
      dirname: config.logFileDir,
      maxsize: 20971520, // 20MB
      maxFiles: 25,
      datePattern: '.dd-MM-yyyy',
    }),
  ],
});

export default logger;