import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { DbRepository } from '../data/db.repository';

describe('HealthService', () => {
  let service: HealthService;
  let repo: jest.Mocked<DbRepository>;

  beforeEach(async () => {
    const mockRepo = {
      ping: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: DbRepository,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    repo = module.get(DbRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return { status: "ok" } when db ping succeeds', async () => {
    repo.ping.mockResolvedValue(true);

    const result = await service.check();
    expect(repo.ping).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ status: 'ok' });
  });
});
