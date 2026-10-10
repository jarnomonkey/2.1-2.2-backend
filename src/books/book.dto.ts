import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { MaterialType, ReadingLevel } from './book.schema.js';

export class CreateBookDto {
  @ApiProperty({ example: 'De brief voor de koning' })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({ example: 'Tonke Dragt' })
  @IsString()
  @MinLength(1)
  author!: string;

  @ApiPropertyOptional({ type: [String], example: ['avontuur'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  genre?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ enum: ReadingLevel, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(ReadingLevel, { each: true })
  readingLevel?: ReadingLevel[];

  @ApiPropertyOptional({ type: [String], example: ['school'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: MaterialType, example: MaterialType.Book })
  @IsEnum(MaterialType)
  materialType!: MaterialType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;
}
