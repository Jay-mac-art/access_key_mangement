import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessKey } from '../../entity/access_key';
import { AccessKeyService } from './access_key.service';
import { AccessKeyController } from './access_key.controller';
import { RedisModule } from '../../providers/redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AccessKey]), RedisModule,AuthModule],
  providers: [AccessKeyService],
  controllers: [AccessKeyController],
})
export class AccessKeyModule {}