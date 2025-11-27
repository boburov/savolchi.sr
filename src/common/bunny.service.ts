import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { randomUUID } from 'crypto';
import * as path from 'path';

@Injectable()
export class BunnyService {
  private readonly apiKey: string;
  private readonly storageZone: string;
  private readonly uploadUrl: string;
  private readonly cdnUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow<string>('bunny.apiKey');
    this.storageZone =
      this.configService.getOrThrow<string>('bunny.storageZone');
    this.uploadUrl = `https://storage.bunnycdn.com/${this.storageZone}/`;
    this.cdnUrl = this.configService.getOrThrow<string>('bunny.cdnHostname');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<string> {
    const ext = path.extname(file.originalname);

    const fileName = `${folder}/${randomUUID()}${ext}`;

    await axios.put(`${this.uploadUrl}${fileName}`, file.buffer, {
      headers: {
        AccessKey: this.apiKey,
        'Content-Type': file.mimetype,
      },
      maxBodyLength: Infinity,
    });

    return `https://${this.cdnUrl}/${fileName}`;
  }

  deleteFile(fileUrl: string): Promise<void> {
    const pathToDelete = fileUrl.split(`https://${this.cdnUrl}/`)[1];
    return axios.delete(`${this.uploadUrl}${pathToDelete}`, {
      headers: { AccessKey: this.apiKey },
    });
  }
}
