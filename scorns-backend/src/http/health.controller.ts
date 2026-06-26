import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../domain/health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly service: HealthService) {}

  @Get()
  check() {
    return this.service.check(); // → 200 { "status": "ok" }
  }
}
