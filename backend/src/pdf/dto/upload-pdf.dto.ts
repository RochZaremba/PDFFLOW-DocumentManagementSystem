import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UploadPdfDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;
}
