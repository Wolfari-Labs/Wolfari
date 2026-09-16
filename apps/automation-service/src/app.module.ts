import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';

@Module({ imports: [InfrastructureModule.forApp('automation-service')] })
export class AppModule {}

