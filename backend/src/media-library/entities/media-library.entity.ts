import { CommonEntity } from '@utils/entities/common.entity';
import { Column, Entity } from 'typeorm';
import { MEDIA_LIBRARY_TYPE } from '../enums/media-library.enum';

@Entity('media_library')
export class MediaLibraryEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  size: number;

  @Column()
  type: MEDIA_LIBRARY_TYPE;

  @Column()
  bucket: string;

  @Column()
  link: string;

  @Column({
    default: false,
  })
  is_upload: boolean;
}
