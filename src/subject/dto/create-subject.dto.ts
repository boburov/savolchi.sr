import { IsEnum, IsNumber, IsString, Length } from 'class-validator';
import { SubjectType } from './subject.enum';

export class CreateSubjectDto {
  @IsString()
  @Length(3, 50, { message: "Subject nomi 3–50 belgi bo'lishi kerak" })
  name: string;

  @IsEnum(SubjectType, {
    message: "type faqat PUBLIC yoki PRIVATE bo'lishi mumkin",
  })
  type: SubjectType;

  @IsNumber()
  time: number;

  @IsString()
  channelId: string;
}
