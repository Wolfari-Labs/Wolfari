import { describe, expect, it } from 'vitest';
import { validateAppEnvironment } from './environment';

describe('application environment', () => {
  it('parses the app-specific port', () => {
    expect(validateAppEnvironment({ GATEWAY_PORT: '3000' }, 'api-gateway').GATEWAY_PORT).toBe(3000);
  });

  it('uses the local default and rejects an invalid override', () => {
    expect(validateAppEnvironment({}, 'api-gateway').GATEWAY_PORT).toBe(3000);
    expect(() => validateAppEnvironment({ GATEWAY_PORT: '70000' }, 'api-gateway')).toThrow(
      'GATEWAY_PORT',
    );
  });
});
