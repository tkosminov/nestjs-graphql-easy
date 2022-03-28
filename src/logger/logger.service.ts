import { Injectable, Logger } from '@nestjs/common';

import config from 'config';

export enum ELogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

const log_level = config.get<ILogSettings>('LOGGER_SETTINGS').level;

@Injectable()
export class LoggerService extends Logger {
  private readonly _current_level: ELogLevel = ELogLevel[log_level];

  constructor(private readonly _context?: string) {
    super(_context);
  }

  public log(message: unknown, context?: string | object) {
    if (this.isValidLevel(ELogLevel.debug)) {
      Logger.log(JSON.stringify(message), JSON.stringify(context) || this._context);
    }
  }

  public info(message: unknown, context?: string | object) {
    if (this.isValidLevel(ELogLevel.info)) {
      Logger.log(JSON.stringify(message), JSON.stringify(context) || this._context);
    }
  }

  public warn(message: unknown, context?: string | object) {
    if (this.isValidLevel(ELogLevel.warn)) {
      Logger.warn(JSON.stringify(message), JSON.stringify(context) || this._context);
    }
  }

  public error(message: unknown, trace?: string, context?: string | object) {
    if (this.isValidLevel(ELogLevel.error)) {
      Logger.error(JSON.stringify(message), trace, JSON.stringify(context) || this._context);
    }
  }

  public isValidLevel(level: ELogLevel): boolean {
    return level >= this._current_level;
  }
}
