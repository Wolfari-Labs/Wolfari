import type { LoggerService } from '@nestjs/common';
import { currentCorrelationId } from './correlation';

export class StructuredLogger implements LoggerService {
  constructor(private readonly service: string) {}

  private write(level: string, message: unknown, context?: string, trace?: string): void {
    const record = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      context,
      correlation_id: currentCorrelationId(),
      message: message instanceof Error ? message.message : message,
      trace,
    };
    const line = JSON.stringify(record);
    (level === 'error' || level === 'fatal' ? process.stderr : process.stdout).write(`${line}\n`);
  }

  log(message: unknown, context?: string): void {
    this.write('info', message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.write('error', message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.write('warn', message, context);
  }

  debug(message: unknown, context?: string): void {
    this.write('debug', message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.write('verbose', message, context);
  }

  fatal(message: unknown, context?: string): void {
    this.write('fatal', message, context);
  }
}

