import { MEDIA_LIBRARY_TYPE, SUPPORTED_EXTENSIONS } from '@media-library/enums/media-library.enum';
import { IsInt, Matches, Min } from 'class-validator';

export class CreateMediaLibraryDto {
  @Matches(`^(.*)\.(${SUPPORTED_EXTENSIONS})$`)
  name: string;

  @IsInt()
  @Min(1)
  size: number;

  type: MEDIA_LIBRARY_TYPE;
}
