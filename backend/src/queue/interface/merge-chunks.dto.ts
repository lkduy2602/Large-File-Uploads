import { MEDIA_LIBRARY_TYPE } from '@media-library/enums/media-library.enum';

export interface MergeChunksDto {
  id: number;
  type: MEDIA_LIBRARY_TYPE;
  bucket: string;
  link: string;
  total_chunks: number;
}
