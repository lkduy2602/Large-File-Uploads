export interface IVideoInfo {
  resolution: {
    width: number;
    height: number;
  };
  videoBitrate: number;
  frameRate: number;
  audioBitrate: number;
  audioRate: number;
}
