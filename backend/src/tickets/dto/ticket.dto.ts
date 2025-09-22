import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsInt,
} from 'class-validator';

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum Status {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

export class CreateTicketDto {
  @IsString()
  @MinLength(5)
  title: string;

  @IsString()
  @MaxLength(5000)
  description: string;

  @IsEnum(Priority)
  priority: Priority;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsEnum(Status)
  status?: Status;
}

export class QueryTicketDto {
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status' | 'title' =
    'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
