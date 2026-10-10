import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsString } from 'class-validator';

export class BookIdDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsMongoId()
  bookId!: string;
}

export class ReadStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isRead!: boolean;
}
