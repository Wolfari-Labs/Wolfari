import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';
import { DatabaseModule } from '@wolfari/database';

@Module({ imports: [InfrastructureModule.forApp('automation-service'), DatabaseModule.forService('automation')] })
export class AppModule {}
