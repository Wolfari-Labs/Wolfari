import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

const storage = new AsyncLocalStorage<string>();
const validCorrelationId = /^[A-Za-z0-9._-]{1,128}$/;

export function normalizeCorrelationId(value: unknown): string {
  return typeof value === 'string' && validCorrelationId.test(value) ? value : randomUUID();
}

export function currentCorrelationId(): string | undefined {
  return storage.getStore();
}

export class CorrelationMiddleware {
  use(request: IncomingMessage, response: ServerResponse, next: () => void): void {
    const correlationId = normalizeCorrelationId(request.headers['x-correlation-id']);
    response.setHeader('x-correlation-id', correlationId);
    storage.run(correlationId, next);
  }
}

