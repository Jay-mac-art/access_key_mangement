import { Injectable, OnModuleInit } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { AccessKeyService } from '../../modules/access_key/access_key.service';
import { ApplicationLogger } from '../../common/logging/ApplicationLogger';
@Injectable()
export class AccessKeySyncService implements OnModuleInit {
  private logger = new ApplicationLogger();
  constructor(
    private readonly redisService: RedisService,
    private readonly accessKeyService: AccessKeyService,
  ) {}

  async onModuleInit() {
    await this.redisService.subscribe('access_key_usage_update', async (msg) => {
      try {
        const { key, currentUsage } = JSON.parse(msg);
        await this.accessKeyService.setUsage(key, currentUsage);
        this.logger.log(`Updated usage for key ${key} → ${currentUsage}`);
      } catch (err) {
        this.logger.error(`Invalid message received or DB update failed: ${err}`);
      }
    });
  }
}
