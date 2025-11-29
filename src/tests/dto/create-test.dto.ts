export class CreateTestDto {
  question: string;
  subjectId: string;
  options: { text: string; isCorrect: boolean }[];
}