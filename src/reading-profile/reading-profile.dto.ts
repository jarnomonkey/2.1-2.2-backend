import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import {
  LengthPreference,
  ReadingGoal,
  ReadingLevel,
} from '../prisma/generated/prisma/client.js';

export class SaveReadingProfileDto {
  @ApiProperty({ enum: ReadingLevel, example: ReadingLevel.NIVEAU_2F })
  @IsEnum(ReadingLevel)
  readingLevel!: ReadingLevel;

  @ApiPropertyOptional({ type: [String], example: ['avontuur'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @ApiProperty({ type: [String], example: ['reizen'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  topics!: string[];

  @ApiPropertyOptional({ enum: LengthPreference })
  @IsOptional()
  @IsEnum(LengthPreference)
  lengthPref?: LengthPreference;

  @ApiPropertyOptional({ enum: ReadingGoal })
  @IsOptional()
  @IsEnum(ReadingGoal)
  readingGoal?: ReadingGoal;
}
