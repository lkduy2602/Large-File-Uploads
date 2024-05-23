export interface UploadMediaStrategy {
  upload(bucket: string, link: string, chunks: string[]): Promise<void>;
}
