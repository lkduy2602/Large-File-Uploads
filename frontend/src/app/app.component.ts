import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { io } from 'socket.io-client';
import { API_DOMAIN, S3_DOMAIN } from '../../environment';
import { CommonUploadService } from './upload/common-upload.service';
import { UploadComponent } from './upload/upload.component';
import { VideoPlayerComponent } from './video-player/video-player.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, UploadComponent, VideoPlayerComponent],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private socket = io(API_DOMAIN);

  chunkProcess = 0;
  isBlockUploadFile = false;

  videoUrl: string = ''; //http://localhost:9000/media/cb6418b1f630c44f66acfe1d7afc60dc;

  constructor(private readonly commonUploadService: CommonUploadService) {}

  ngOnInit(): void {
    this.commonUploadService.allPackages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.onSocketSuccessUpload(res);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSocketSuccessUpload(link: string) {
    this.socket.on(`success_upload_${link}`, (data: string) => {
      this.videoUrl = S3_DOMAIN + data;
      this.chunkProcess = 100;
      this.isBlockUploadFile = false;
    });
  }
}
