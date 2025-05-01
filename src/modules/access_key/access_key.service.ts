import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccessKey } from '../../entity/access_key';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from '../../providers/redis/redis.service';
import { ErrorMessage } from '../../common/constants/error.message';
import * as crypto from 'crypto';
import { ApplicationLogger } from '../../common/logging/ApplicationLogger';

@Injectable()
export class AccessKeyService {
  private readonly logger = new ApplicationLogger();

  constructor(
    @InjectRepository(AccessKey)
    private accessKeyRepository: Repository<AccessKey>,
    private redisService: RedisService,
    private dataSource: DataSource,
  ) {}

  async setUsage(key: string, usage: number) {
    this.logger.debug(`Set usage of ${key} => ${usage}`);
    await this.dataSource
      .getRepository(AccessKey)
      .update({ key }, { currentUsage: usage });
  }

  async generateKey(rateLimit: number, expiration: Date): Promise<AccessKey> {
    this.logger.log(`Generating new key (limit=${rateLimit}, exp=${expiration.toISOString()})`);
    const rawKey = `${uuidv4()}-${crypto.randomBytes(32).toString('hex')}`;
    const base64Key = Buffer.from(rawKey).toString('base64');

    const accessKey = this.accessKeyRepository.create({
      key: base64Key,
      rateLimit,
      expiration,
    });
    const savedKey = await this.accessKeyRepository.save(accessKey);

    this.logger.log(`Key created: ${savedKey.key}`);
    this.redisService.publish('key_updated', JSON.stringify(savedKey));
    return savedKey;
  }

  async deleteKey(id: string): Promise<void> {
    this.logger.log(`Deleting key id=${id}`);
    const result = await this.accessKeyRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Delete failed, key not found: ${id}`);
      throw ErrorMessage.Access_Key.accessKeyNotFound;
    }
    this.redisService.publish('key_deleted', JSON.stringify({ id }));
    this.logger.log(`Key deleted: ${id}`);
  }

 // src/modules/access_key/access_key.service.ts

async updateKey(
  id: string,
  rateLimit?: number,
  expiration?: Date,
  currentUsage?: number,
  threshold?: number,
): Promise<AccessKey> {
  this.logger.log(`Updating key id=${id}`);
  const accessKey = await this.accessKeyRepository.findOne({ where: { id } });
  if (!accessKey) {
    this.logger.error(`Update failed, key not found: ${id}`);
    throw ErrorMessage.Access_Key.invalidRequest;
  }

  if (rateLimit !== undefined) {
    accessKey.rateLimit = rateLimit;
    this.logger.debug(` → new rateLimit=${rateLimit}`);
  }
  if (expiration !== undefined) {
    accessKey.expiration = expiration;
    this.logger.debug(` → new expiration=${expiration.toISOString()}`);
  }
  if (currentUsage !== undefined) {
    accessKey.currentUsage = currentUsage;
    this.logger.debug(` → new currentUsage=${currentUsage}`);
  }
  if (threshold !== undefined) {
    accessKey.threshold = threshold;
    this.logger.debug(` → new threshold=${threshold}`);
  }

  const updatedKey = await this.accessKeyRepository.save(accessKey);
  this.logger.log(`Key updated: ${updatedKey.key}`);
  this.redisService.publish('key_updated', JSON.stringify(updatedKey));
  return updatedKey;
}


  async getKeyDetails(key: string): Promise<AccessKey> {
    this.logger.log(`Fetching details for key=${key}`);
    const accessKey = await this.accessKeyRepository.findOne({ where: { key } });
    if (!accessKey) {
      this.logger.warn(`Key not found: ${key}`);
      throw ErrorMessage.Access_Key.invalidRequest;
    }
    return accessKey;
  }

  async disableKey(key: string): Promise<void> {
    this.logger.log(`Disabling key=${key}`);
    const accessKey = await this.accessKeyRepository.findOne({ where: { key } });
    if (!accessKey) {
      this.logger.error(`Disable failed, key not found: ${key}`);
      throw ErrorMessage.Access_Key.invalidRequest;
    }
    accessKey.isActive = false;
    const updatedKey = await this.accessKeyRepository.save(accessKey);
    this.logger.log(`Key disabled: ${key}`);
    this.redisService.publish('key_updated', JSON.stringify(updatedKey));
  }

  async listKeys(): Promise<AccessKey[]> {
    this.logger.log(`Listing all keys`);
    return this.accessKeyRepository.find();
  }
}
