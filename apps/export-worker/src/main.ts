import 'reflect-metadata';
import { bootstrapApp } from '@wolfari/common';
import { AppModule } from './app.module';

void bootstrapApp(AppModule, 'export-worker').catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});

