import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import {
  Observable,
  Subject,
  lastValueFrom,
  retry,
  takeUntil,
  timeout,
} from 'rxjs';
import { generateUrl } from '../_utils/enum/common.enum';
import { CommonUploadService } from './common-upload.service';
import {
  MEDIA_LIBRARY_TYPE,
  SUPPORTED_IMAGE,
  SUPPORTED_VIDEO,
} from './enum/upload.enum';
import {
  IReqCreateMediaLibrary,
  IResCreateMediaLibrary,
} from './interface/upload.interface';

@Injectable()
export class UploadService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly uploadMediaLibrary$ = new Subject<{
    totalChunks: number;
    chunkNumber: number;
  }>();

  constructor(
    private readonly http: HttpClient,
    private readonly commonUploadService: CommonUploadService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  createMediaLibrary(file: File): Observable<IResCreateMediaLibrary> {
    const { name, size } = file;
    const type = this.checkTypeMediaLibrary(file.type);

    const body: IReqCreateMediaLibrary = {
      name,
      size,
      type,
    };

    return this.http.post<IResCreateMediaLibrary>(
      generateUrl('/media-library/create'),
      body
    );
  }

  private checkTypeMediaLibrary(mimeType: string): MEDIA_LIBRARY_TYPE {
    if (SUPPORTED_IMAGE.includes(mimeType)) return MEDIA_LIBRARY_TYPE.IMAGE;
    if (SUPPORTED_VIDEO.includes(mimeType)) return MEDIA_LIBRARY_TYPE.VIDEO;

    return MEDIA_LIBRARY_TYPE.IMAGE;
  }

  async uploadMediaLibrary(
    createMediaLibrary: IResCreateMediaLibrary,
    file: File
  ) {
    const chunkSize = 5 * 1024 * 1024; // MB
    const totalChunks = Math.ceil(file.size / chunkSize);

    const formData = new FormData();
    formData.set('id', String(createMediaLibrary.id));
    formData.set('type', String(createMediaLibrary.type));
    formData.set('total_chunks', String(totalChunks));

    let start = 0;
    let end = chunkSize;
    for (let i = 0; i < totalChunks; i++) {
      const chunk = file.slice(start, end);

      formData.set('chunk_number', String(i));
      formData.set('file', chunk);

      await lastValueFrom(
        this.http
          .post(generateUrl('/media-library/upload'), formData)
          .pipe(
            takeUntil(this.destroy$),
            timeout(15000),
            retry({ delay: 5000 })
          )
      );

      this.uploadMediaLibrary$.next({
        totalChunks: totalChunks,
        chunkNumber: i,
      });

      if (i === totalChunks - 1) {
        this.commonUploadService.allPackages(createMediaLibrary.link);
      }

      start = end;
      end += chunkSize;
    }
  }
}
