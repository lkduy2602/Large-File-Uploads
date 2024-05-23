import { Body, Controller, ParseFilePipeBuilder, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMediaLibraryDto } from './dto/create-media-library.dto';
import { UploadMediaLibraryDto } from './dto/upload-media-library.dto';
import { MediaLibraryService } from './media-library.service';

@Controller('media-library')
export class MediaLibraryController {
  constructor(private readonly mediaLibraryService: MediaLibraryService) {}

  @Post('create')
  async createMediaLibrary(@Body() body: CreateMediaLibraryDto) {
    return await this.mediaLibraryService.createMediaLibrary(body);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadMediaLibrary(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 5242881, //byte
        })
        .build(),
    )
    file: Express.Multer.File,
    @Body() body: UploadMediaLibraryDto,
  ) {
    return await this.mediaLibraryService.uploadMediaLibrary(file, body);
  }
}
