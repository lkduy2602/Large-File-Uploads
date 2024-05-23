import { MEDIA_LIBRARY_TYPE } from '@media-library/enums/media-library.enum';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';

export class UploadMediaLibraryDto {
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  id: number;

  @Transform(({ value }) => parseInt(value))
  @IsEnum(MEDIA_LIBRARY_TYPE)
  type: MEDIA_LIBRARY_TYPE;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  chunk_number: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  total_chunks: number;
}
