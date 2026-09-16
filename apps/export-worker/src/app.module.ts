import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';

@Module({ imports: [InfrastructureModule.forApp('export-worker')] })
export class AppModule {}

