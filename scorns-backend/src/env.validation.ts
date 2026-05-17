import { IsNumber, IsString, IsOptional } from 'class-validator';

export class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  @IsOptional()
  DATABASE_URL?: string;

  @IsString()
  JWT_SECRET: string;
}
