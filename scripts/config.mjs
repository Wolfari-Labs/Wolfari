import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { randomBytes } from 'node:crypto';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const services = ['identity', 'trip', 'travel', 'finance', 'automation'];
export const appNames = {
  identity: 'identity-service', trip: 'trip-workspace-service',
  travel: 'travel-intelligence-service', finance: 'finance-service',
  automation: 'automation-service',
};
export const apps = [
  { name: 'api-gateway', portKey: 'GATEWAY_PORT', port: 3000 },
  ...services.map((service, i) => ({ name: appNames[service], service, portKey: `${service.toUpperCase()}_PORT`, port: 3101 + i })),
  { name: 'export-worker', portKey: 'EXPORT_WORKER_PORT', port: 3106 },
];

export async function readEnv(path) {
  try { return parseEnv(await readFile(path, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') throw new Error(`Thiếu cấu hình ${path}; chạy pnpm env:init.`); throw error; }
}

export function validateInfra(env) {
  for (const service of services) {
    if (env[`${service.toUpperCase()}_DB_USER`] !== `${service}_app`) throw new Error(`Role ${service} phải là ${service}_app theo V001.`);
  }
  for (const key of ['POSTGRES_PASSWORD', 'RABBITMQ_DEFAULT_PASS', 'MINIO_ROOT_PASSWORD', ...services.map(s => `${s.toUpperCase()}_DB_PASSWORD`)]) {
    if (!env[key] || env[key].startsWith('change-me')) throw new Error(`Cần cấu hình secret hợp lệ cho ${key}.`);
  }
  for (const key of ['POSTGRES_PORT', 'RABBITMQ_PORT', 'RABBITMQ_MANAGEMENT_PORT', 'MINIO_API_PORT', 'MINIO_CONSOLE_PORT']) {
    if (!/^\d+$/.test(env[key] ?? '') || +env[key] < 1024 || +env[key] > 65535) throw new Error(`Cổng không hợp lệ: ${key}.`);
  }
  return env;
}

export function databaseUrl(env, service) {
  const url = new URL(`postgresql://127.0.0.1:${env.POSTGRES_PORT}/${service}_db`);
  url.username = `${service}_app`;
  url.password = env[`${service.toUpperCase()}_DB_PASSWORD`];
  return url.href;
}

export function appEnvironment(app, values, inherited = process.env) {
  // Retain OS/tooling variables, never another app's credentials or Node injection flags.
  const clean = Object.fromEntries(Object.entries(inherited).filter(([key]) =>
    !/^(DATABASE_|PG|POSTGRES_|IDENTITY_|TRIP_|TRAVEL_|FINANCE_|AUTOMATION_|RABBITMQ_|MINIO_|GATEWAY_PORT$|EXPORT_WORKER_PORT$|NODE_OPTIONS$)/i.test(key)));
  const allowed = ['NODE_ENV', app.portKey, ...(app.service ? ['DATABASE_URL', 'DATABASE_POOL_MAX', 'DATABASE_CONNECT_TIMEOUT_MS', 'DATABASE_IDLE_TIMEOUT_MS', 'DATABASE_STATEMENT_TIMEOUT_MS'] : [])];
  for (const key of allowed) if (values[key] !== undefined) clean[key] = values[key];
  return clean;
}

export async function initEnvironment(base = root) {
  let template = await readFile(resolve(base, '.env.example'), 'utf8');
  template = template.replace(/change-me-[\w-]+/g, () => randomBytes(24).toString('hex'));
  await createOnce(resolve(base, '.env'), template);
  const infra = validateInfra(await readEnv(resolve(base, '.env')));
  for (const app of apps) {
    let content = await readFile(resolve(base, 'apps', app.name, '.env.example'), 'utf8');
    if (app.service) content = content.replace('DATABASE_URL=', `DATABASE_URL=${databaseUrl(infra, app.service)}`);
    const path = resolve(base, 'apps', app.name, '.env');
    await createOnce(path, content);
    const existing = await readEnv(path);
    if (app.service && existing.DATABASE_URL !== databaseUrl(infra, app.service)) {
      throw new Error(`Cấu hình ${app.name} khác root .env; giữ nguyên file, cần đồng bộ credential/cổng thủ công.`);
    }
  }
}

async function createOnce(path, content) {
  await mkdir(dirname(path), { recursive: true });
  try { await writeFile(path, content, { flag: 'wx', mode: 0o600 }); }
  catch (error) { if (error.code !== 'EEXIST') throw error; }
}
