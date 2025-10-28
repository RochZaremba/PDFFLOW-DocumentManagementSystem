import { IsArray, IsString, ArrayMinSize } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignTagsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => {
    // Normalizuj każdy tag do lowercase i usuń duplikaty
    if (Array.isArray(value)) {
      return [...new Set(value.map(tag => tag.trim().toLowerCase()))];
    }
    return value;
  })
  tagNames: string[]; // array nazw tagów
}
