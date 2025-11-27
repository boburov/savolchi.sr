// config/bunny.config.ts
import { registerAs } from '@nestjs/config';

export default registerAs('bunny', () => ({
  storageZone: process.env.BUNNY_STORAGE_ZONE,
  apiKey: process.env.BUNNY_API_KEY,
  cdnHostname: process.env.BUNNY_CDN_HOSTNAME,
  uploadUrl: `https://storage.bunnycdn.com/${process.env.BUNNY_STORAGE_ZONE}/`,
}));
