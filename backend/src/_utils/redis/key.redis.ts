export const REDIS_KEY = {
  MEDIA_CHUNK: (id: number, chunkNumber: number | string) => {
    return 'MEDIA_CHUNK' + ':' + id + ':' + chunkNumber;
  },
};
