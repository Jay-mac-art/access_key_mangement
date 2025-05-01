import { IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateKeyDto {
  @IsNumber({}, { message: 'Rate limit must be a number' })
  rateLimit: number;

  @IsDateString({}, { message: 'Expiration must be a valid date string' })
  expiration: string;
}

export class UpdateKeyDto {
    @IsNumber({}, { message: 'Rate limit must be a number' })
    @IsOptional()
    rateLimit?: number;

    @IsNumber({}, { message: 'CurrentUsage must be a number' })
    @IsOptional()
    currentUsage?: number;

    @IsNumber({}, { message: 'Threshold limit must be a number' })
    @IsOptional()
    threshold?: number;
  
    @IsDateString({}, { message: 'Expiration must be a valid date string' })
    @IsOptional()
    expiration?: string;
  }