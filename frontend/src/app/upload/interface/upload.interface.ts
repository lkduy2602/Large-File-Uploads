import { MEDIA_LIBRARY_TYPE } from '../enum/upload.enum';

export interface IReqCreateMediaLibrary {
  name: string;
  size: number;
  type: MEDIA_LIBRARY_TYPE;
}

export interface IResCreateMediaLibrary {
  id: number;
  name: string;
  size: number;
  type: number;
  bucket: string;
  link: string;
}
