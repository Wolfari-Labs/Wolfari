import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';

@Module({ imports: [InfrastructureModule.forApp('api-gateway')] })
export class AppModule {}

