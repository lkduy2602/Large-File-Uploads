import { MEDIA_LIBRARY_TYPE } from '@media-library/enums/media-library.enum';

export class CreateMediaLibraryResponse {
  id: number;
  name: string;
  size: number;
  type: MEDIA_LIBRARY_TYPE;
  bucket: string;
  link: string;

  constructor(data?: CreateMediaLibraryResponse) {
    this.id = data?.id || 0;
    this.name = data?.name || '';
    this.size = data?.size || 0;
    this.type = data?.type || MEDIA_LIBRARY_TYPE.IMAGE;
    this.bucket = data?.bucket || '';
    this.link = data?.link || '';
  }
}
