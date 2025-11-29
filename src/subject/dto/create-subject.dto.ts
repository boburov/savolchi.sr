import { IsString, Length } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @Length(3, 50, { message: "Subject nomi 3–50 belgi bo'lishi kerak" })
  name: string;

  @IsString()
  channelId: string;
}
