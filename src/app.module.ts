import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PostgresModule }     from './config/database/postgres.module';
import { ConfigurationModule } from './config/config.module';
import { RedisModule }        from './providers/redis/redis.module';
import { AccessKeyModule }    from './modules/access_key/access_key.module';
import { AuthModule }         from './modules/auth/auth.module';
import { AccessKeySyncService } from './providers/access-key-sync/access-key-sync';
import { AccessKeyService } from './modules/access_key/access_key.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessKey } from './entity/access_key';

@Module({
  imports: [
    TypeOrmModule.forFeature([AccessKey]),
    ConfigurationModule,  
    PostgresModule,
    RedisModule,
    AccessKeyModule,
    AuthModule,         
  ],
  controllers: [AppController],
  providers: [AppService , AccessKeyService, AccessKeySyncService],
})
export class AppModule {}