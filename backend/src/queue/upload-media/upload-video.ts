import { Injectable } from '@nestjs/common';
import { IVideoInfo } from '@queue/interface/video-info.interface';
import { Minio } from '@setting/minio/minio';
import { spawn } from 'child_process';
import { createWriteStream, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { UploadMediaStrategy } from './_upload-media.strategy';
import { ConnectionGateway } from '@connection/connection.gateway';

@Injectable()
export class UploadVideo implements UploadMediaStrategy {
  private readonly RESOLUTIONS_DEFAULT = [
    {
      resolutionHeight: 1080,
      maximumVideoBitrate: 4 * 10 ** 6, // 4Mbps
      maximumAudioBitrate: 128 * 10 ** 3, // 128Kbps
      bandWidth: 6221600,
    },
    {
      resolutionHeight: 720,
      maximumVideoBitrate: 2 * 10 ** 6, // 2Mbps
      maximumAudioBitrate: 96 * 10 ** 3, // 96Kbps
      bandWidth: 2149280,
    },
    {
      resolutionHeight: 480,
      maximumVideoBitrate: 1 * 10 ** 6, // 1Mbps
      maximumAudioBitrate: 64 * 10 ** 3, // 64Kbps
      bandWidth: 836280,
    },
    {
      resolutionHeight: 360,
      maximumVideoBitrate: 0.5 * 10 ** 6, // 0.5Mbps
      maximumAudioBitrate: 48 * 10 ** 3, // 48Kbps
      bandWidth: 460560,
    },
  ];

  constructor(private readonly minio: Minio, private readonly connectionGateway: ConnectionGateway) {}

  async upload(bucket: string, link: string, chunks: string[]): Promise<void> {
    const mainPath = bucket + '/' + link;
    const pathVideo = await this.writeFileStream(mainPath, link, chunks);

    const videoInfo = await this.getVideoInfo(pathVideo);
    console.time('CONVERT_TO_HLS_VIDEO');
    const hlsPath = await this.convertToHlsVideo(mainPath, pathVideo, link, videoInfo);
    console.timeEnd('CONVERT_TO_HLS_VIDEO');
    await this.uploadToS3(bucket, link, hlsPath);
    this.connectionGateway.emitSuccessUpload(bucket, link);
  }

  private writeFileStream(mainPath: string, link: string, chunks: string[]) {
    const fullPath = mainPath + '/' + link;

    return new Promise<string>((resolve, reject) => {
      const writeFile = createWriteStream(fullPath, 'base64');
      chunks.forEach(chunk => {
        writeFile.write(Buffer.from(chunk, 'base64'));
      });
      writeFile.end();

      writeFile.on('error', err => {
        reject(err);
      });

      writeFile.on('finish', () => {
        resolve(fullPath);
      });
    });
  }

  private getVideoInfo(pathVideo: string) {
    const inputFile = `${process.cwd()}/${pathVideo}`;

    return new Promise<IVideoInfo>((resolve, reject) => {
      let error = '';

      const child = spawn('ffprobe', [
        '-v',
        'error',
        '-print_format',
        'json',
        '-show_format',
        '-show_streams',
        `${inputFile}`,
      ]);

      child.stderr.setEncoding('utf-8');
      child.stderr.on('data', data => {
        error += data + '\n';
      });

      let stdoutData = '';
      child.stdout.setEncoding('utf-8');
      child.stdout.on('data', data => {
        stdoutData += data;
      });

      child.on('close', code => {
        if (code != 0) return reject(new Error(error));

        const videoInfo: IVideoInfo = {
          resolution: {
            width: 0,
            height: 0,
          },
          videoBitrate: 0,
          frameRate: 0,
          audioBitrate: 0,
          audioRate: 0,
        };
        const data = JSON.parse(stdoutData);
        for (const item of data.streams) {
          if (item.codec_type == 'video') {
            videoInfo.resolution.width = !isNaN(+item.width) ? +item.width : 0;
            videoInfo.resolution.height = !isNaN(+item.height) ? +item.height : 0;
            videoInfo.videoBitrate = !isNaN(+item.bit_rate) ? +item.bit_rate : 0;

            const frameRate = eval(item?.avg_frame_rate);
            videoInfo.frameRate = frameRate || 0;
          } else if (item.codec_type == 'audio') {
            videoInfo.audioBitrate = !isNaN(+item.bit_rate) ? +item.bit_rate : 0;
            videoInfo.audioRate = !isNaN(+item.sample_rate) ? +item.sample_rate : 0;
          }
        }

        return resolve(videoInfo);
      });
    });
  }

  private getWidth(height: number, resolution: { width: number; height: number }) {
    const width = Math.round((height * resolution.width) / resolution.height);
    // Vì ffmpeg yêu cầu width và height phải là số chẵn
    return width % 2 === 0 ? width : width + 1;
  }

  private convertToHlsVideo(mainPath: string, pathVideo: string, link: string, videoInfo: IVideoInfo) {
    const hlsPath = mainPath + '/hls';
    mkdirSync(hlsPath);
    const inputFile = `${process.cwd()}/${pathVideo}`;

    let resolutions = this.RESOLUTIONS_DEFAULT.filter(
      resolution => videoInfo.resolution.height >= resolution.resolutionHeight,
    );
    resolutions = resolutions.length ? resolutions : [this.RESOLUTIONS_DEFAULT[this.RESOLUTIONS_DEFAULT.length - 1]];

    let masterFile = '#EXTM3U';
    const args = ['-y'];

    if (+process.env.IS_GPU_ENABLED) {
      args.push('-vsync', '0', '-hwaccel', 'cuda', '-hwaccel_output_format', 'cuda');
    }

    args.push('-i', inputFile);

    resolutions.forEach(resolution => {
      const { resolutionHeight, maximumVideoBitrate, maximumAudioBitrate } = resolution;
      const width = this.getWidth(resolutionHeight, videoInfo.resolution);

      const segmentPath = `${process.cwd()}/${hlsPath}/${resolutionHeight}p_${link}_%05d.ts`;

      const masterName = `${resolutionHeight}_${link}p.m3u8`;
      const masterPath = `${process.cwd()}/${hlsPath}/${masterName}`;

      args.push('-vf');
      if (+process.env.IS_GPU_ENABLED) {
        args.push(`scale_cuda=${width}:${resolutionHeight}`);
        args.push('-c:v', 'h264_nvenc');
      } else {
        args.push(`scale=${width}x${resolutionHeight}`);
        args.push('-c:v', 'h264');
      }

      args.push('-profile:v', 'main');
      args.push('-crf', '20');
      args.push('-sc_threshold', '0');
      args.push('-g', '48');
      args.push('-keyint_min', '48');
      args.push('-hls_time', '6');
      args.push('-hls_playlist_type', 'vod');
      args.push('-hls_segment_filename', segmentPath);

      if (videoInfo.videoBitrate > maximumVideoBitrate) args.push('-b:v', `${maximumVideoBitrate}`);
      if (videoInfo.frameRate > 60) args.push('-r', '60');
      if (videoInfo.audioBitrate) {
        args.push('-c:a', 'aac');

        if (videoInfo.audioRate > 44100) args.push('-ar', '44100');
        if (videoInfo.audioBitrate > maximumAudioBitrate) args.push('-b:a', `${maximumAudioBitrate}`);
      }
      args.push(masterPath);

      masterFile += `\n#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bandWidth},RESOLUTION=${width}x${resolutionHeight},NAME="${resolutionHeight}"`;
      masterFile += `\n${masterName}`;
    });

    return new Promise<string>((resolve, reject) => {
      let error = '';

      const ffmpeg = spawn('ffmpeg', args);

      ffmpeg.stdout.on('data', data => {
        console.log(`stdout: ${data.toString()}`);
      });

      ffmpeg.stderr.on('data', data => {
        error += data + '\n';
      });

      ffmpeg.on('close', code => {
        if (code !== 0) return reject(new Error(error));

        const masterPath = `${hlsPath}/master.m3u8`;
        writeFileSync(masterPath, masterFile);

        return resolve(hlsPath);
      });
    });
  }

  private async uploadToS3(bucket: string, link: string, hlsPath: string) {
    const files = readdirSync(hlsPath);
    for (const file of files) {
      let objectName = file;
      let contentType = null;
      if (file.endsWith('.m3u8')) {
        contentType = 'application/x-mpegURL';

        if (file == 'master.m3u8') objectName = link;
      } else if (file.endsWith('.ts')) {
        contentType = 'video/mp2t';
      }

      const metaData = {
        'Content-Type': contentType,
      };
      await this.minio.fPutObject(bucket, objectName, hlsPath + '/' + file, metaData);
    }
  }
}
