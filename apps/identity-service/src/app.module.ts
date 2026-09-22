import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';
import { DatabaseModule } from '@wolfari/database';

@Module({ imports: [InfrastructureModule.forApp('identity-service'), DatabaseModule.forService('identity')] })
export class AppModule {}
