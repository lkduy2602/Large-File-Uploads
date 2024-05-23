import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import 'videojs-contrib-quality-levels';
import 'videojs-hls-quality-selector';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoTarget', { static: true })
  private readonly videoTarget: ElementRef | undefined;

  private player: videojs.Player | undefined;

  @Input({ required: true })
  videoUrl!: string;

  private readonly videoJsPlayerOptions: videojs.PlayerOptions = {
    width: 640,
    height: 360,

    autoplay: false,
    controls: true,
    liveui: true,
    preload: 'metadata',
    html5: {
      nativeVideoTracks: false,
      nativeAudioTracks: false,
      nativeTextTracks: false,
      hls: {
        withCredentials: false,
        overrideNative: true,
        debug: true,
      },
    },
  };

  constructor() {}

  ngOnInit(): void {
    this.initVideoPlayer();
  }

  ngOnDestroy(): void {
    if (this.player) this.player.dispose();
  }

  private initVideoPlayer() {
    this.videoJsPlayerOptions.sources = [
      {
        src: this.videoUrl,
        type: 'application/x-mpegURL',
      },
    ];

    this.player = videojs(
      this.videoTarget?.nativeElement,
      this.videoJsPlayerOptions
    );
    this.player.hlsQualitySelector({
      displayCurrentQuality: true,
    });
  }
}
