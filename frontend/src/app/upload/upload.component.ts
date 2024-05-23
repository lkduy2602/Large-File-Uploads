import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subject, catchError, takeUntil, throwError } from 'rxjs';
import { UploadService } from './upload.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
  providers: [UploadService],
})
export class UploadComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  errors: string[] = [];
  file: File | null = null;

  @Input({ required: true })
  chunkProcess!: number;

  @Input({ required: true })
  isBlockUploadFile!: boolean;

  constructor(private readonly uploadService: UploadService) {}

  ngOnInit(): void {
    this.uploadService.uploadMediaLibrary$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        const chunkNumber = res.chunkNumber + 1;
        this.chunkProcess =
          Math.floor((chunkNumber / res.totalChunks) * 100) - 1;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onChangeInputFile(event: Event): void {
    this.resetState();

    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    this.file = input.files[0];
  }

  onClickUploadFile(): void {
    this.isBlockUploadFile = true;
    this.resetState();

    if (!this.file) {
      this.errors.push('Chưa chọn file!');
      return;
    }

    this.uploadService
      .createMediaLibrary(this.file)
      .pipe(
        takeUntil(this.destroy$),
        catchError((err: HttpErrorResponse) => {
          this.errors.push(err.statusText);
          return throwError(() => err);
        })
      )
      .subscribe(async (res) => {
        if (!this.file) return;

        return await this.uploadService.uploadMediaLibrary(res, this.file);
      });
  }

  private resetState() {
    this.errors = [];
    this.chunkProcess = 0;
    this.isBlockUploadFile = false;
  }
}
