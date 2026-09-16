import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@wolfari/common';

@Module({ imports: [InfrastructureModule.forApp('travel-intelligence-service')] })
export class AppModule {}

