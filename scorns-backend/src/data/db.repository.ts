import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DbRepository {
  constructor(private readonly dataSource: DataSource) {}

  // a real liveness check: round-trip to the DB
  async ping(): Promise<boolean> {
    await this.dataSource.query('SELECT 1');
    return true;
  }
}
