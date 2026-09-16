import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';

@Module({ imports: [InfrastructureModule.forApp('finance-service')] })
export class AppModule {}

