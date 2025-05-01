import { Test, TestingModule } from '@nestjs/testing';
import { AccessKeyService } from '../src/modules/access_key/access_key.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessKey } from '../src/entity/access_key';
import { Repository, DataSource } from 'typeorm';
import { RedisService } from '../src/providers/redis/redis.service';

describe('AccessKeyService', () => {
  let service: AccessKeyService;
  let repository: Repository<AccessKey>;
  let redisService: RedisService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockRedisService = {
    publish: jest.fn(),
    subscribe: jest.fn(),
    on: jest.fn(),
  };

  const mockDataSource = {
    getRepository: jest.fn().mockReturnValue(mockRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessKeyService,
        {
          provide: getRepositoryToken(AccessKey),
          useValue: mockRepository,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AccessKeyService>(AccessKeyService);
    repository = module.get<Repository<AccessKey>>(getRepositoryToken(AccessKey));
    redisService = module.get<RedisService>(RedisService);
  });

  it('should generate a key and publish an event', async () => {
    const rateLimit = 100;
    const expiration = new Date();
    const accessKey = {
      id: '1',
      key: 'abc',
      rateLimit,
      expiration,
      isActive: true,
      currentUsage: 0,
      isDeleted: false,
      comment: '',
      deletedBy: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.create.mockReturnValue(accessKey);
    mockRepository.save.mockResolvedValue(accessKey);

    const result = await service.generateKey(rateLimit, expiration);

    expect(result).toEqual(accessKey);
    expect(mockRepository.create).toHaveBeenCalledWith({
      key: expect.any(String),
      rateLimit,
      expiration,
    });
    expect(mockRepository.save).toHaveBeenCalledWith(accessKey);
    expect(mockRedisService.publish).toHaveBeenCalledWith('key_updated', JSON.stringify(accessKey));
  });
});
