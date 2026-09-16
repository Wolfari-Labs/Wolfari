import { describe, expect, it } from 'vitest';
import { currentCorrelationId, normalizeCorrelationId } from './correlation';

describe('correlation ID foundation', () => {
  it('keeps safe incoming IDs and replaces invalid ones', () => {
    expect(normalizeCorrelationId('request-123')).toBe('request-123');
    expect(normalizeCorrelationId('bad\nheader')).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('has no ambient request ID outside a request', () => {
    expect(currentCorrelationId()).toBeUndefined();
  });
});

