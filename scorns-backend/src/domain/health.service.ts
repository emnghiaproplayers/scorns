import { Injectable } from '@nestjs/common';
import { DbRepository } from '../data/db.repository';

@Injectable()
export class HealthService {
  constructor(private readonly repo: DbRepository) {}

  // returns liveness; domain decides what "healthy" means
  async check(): Promise<{ status: string }> {
    await this.repo.ping();
    return { status: 'ok' };
  }
}
