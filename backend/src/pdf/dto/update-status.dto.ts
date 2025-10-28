import { IsEnum } from 'class-validator';
import { PdfStatus } from '../../entities/pdf-file.entity';

export class UpdateStatusDto {
  @IsEnum(PdfStatus)
  status: PdfStatus;
}
