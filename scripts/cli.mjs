import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { root, services, apps, appNames, readEnv, initEnvironment } from './config.mjs';
import { compose, infrastructureCheck } from './infrastructure.mjs';
import { connectDatabase, migrate, migrationFiles, history, safeError } from './migrations.mjs';

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'env:init') { await initEnvironment(); console.log('Cấu hình local sẵn sàng; giữ nguyên mọi file đã tồn tại.'); return; }
  if (command?.startsWith('infra:')) {
    if (args.length) throw new Error('Lệnh hạ tầng không nhận tham số.');
    const env = await readEnv(resolve(root, '.env'));
    if (command === 'infra:up') { await compose(env, ['up', '-d', '--wait', '--wait-timeout', '180']); await infrastructureCheck(env); }
    else if (command === 'infra:down') await compose(env, ['down']);
    else if (command === 'infra:check') await infrastructureCheck(env);
    else throw new Error('Lệnh hạ tầng không hợp lệ.');
    return;
  }
  if (command === 'dev:check') {
    for (const app of apps) {
      const env = await readEnv(resolve(root, 'apps', app.name, '.env'));
      for (const endpoint of ['live', ...(app.service ? ['ready'] : [])]) {
        const response = await fetch(`http://127.0.0.1:${env[app.portKey]}/health/${endpoint}`, { signal: AbortSignal.timeout(4000) });
        const body = await response.json();
        if (!response.ok || body.service !== app.name || body.status !== 'ok') throw new Error(`HEALTH_CHECK_FAILED`);
        console.log(`PASS ${app.name} /health/${endpoint}`);
      }
    }
    return;
  }
  if (!['db:status', 'db:migrate', 'db:inspect'].includes(command)) throw new Error('Lệnh không hợp lệ.');
  const selected = args.length === 0 ? services : args.length === 2 && args[0] === '--service' && services.includes(args[1]) ? [args[1]] : null;
  if (!selected) throw new Error('Dùng --service identity|trip|travel|finance|automation.');
  for (const service of selected) {
    const env = await readEnv(resolve(root, 'apps', appNames[service], '.env'));
    const files = await migrationFiles(service);
    if (command === 'db:migrate') { console.log(`${service}: ${(await migrate(service, env.DATABASE_URL, files)).join(', ')} — sẵn sàng`); continue; }
    const client = await connectDatabase(service, env.DATABASE_URL);
    try {
      if (command === 'db:status') {
        const applied = await history(client, files);
        console.log(`${service}: đã chạy [${applied.join(', ')}], còn thiếu [${files.filter(f => !applied.includes(f.version)).map(f => f.version).join(', ')}]`);
      } else {
        const result = await client.query(await readFile(resolve(root, 'infrastructure/postgres/inspect-schema.sql'), 'utf8'));
        console.log(service, JSON.stringify(result.map(r => r.rows), null, 2));
      }
    } finally { await client.end(); }
  }
}
main().catch(error => { console.error(safeError(error)); process.exitCode = 1; });
