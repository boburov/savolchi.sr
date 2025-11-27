import { IsString, Length, Matches, IsOptional, IsUrl } from 'class-validator';

export class CreateChanelDto {
  @IsString()
  @Length(3, 30, {
    message: "Channel name 3–30 belgi oralig'ida bo'lishi kerak",
  })
  @Matches(/^[a-zA-Z0-9\s\-_.]+$/, {
    message: "Channel name faqat harf, raqam va probel bo'lishi mumkin",
  })
  name: string;

  @IsString()
  @Length(30, 300, { message: "Bio kamida 30ta belgi bo'lishi kerak" })
  bio: string;

  @IsOptional()
  @IsUrl({}, { message: "pfp URL bo'lishi kerak" })
  pfp?: string;

  @IsOptional()
  @IsUrl({}, { message: "banner URL bo'lishi kerak" })
  banner?: string;
}
