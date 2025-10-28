import { IsOptional, IsString, IsArray, IsInt, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryPdfDto {
  @IsOptional()
  @IsString()
  search?: string; // wyszukiwanie w tytule

  @IsOptional()
  @Transform(({ value }) => {
    // Konwertuj string "tag1,tag2" na array
    if (typeof value === 'string') {
      return value.split(',').map(tag => tag.trim());
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  tags?: string[]; // filtrowanie po tagach

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1; // domyślnie strona 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20; // domyślnie 20 na stronę

  @IsOptional()
  @IsString()
  sort?: string = 'createdAt'; // domyślnie sortuj po dacie utworzenia

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC']) // Dodane dla silniejszej walidacji
  order?: 'ASC' | 'DESC' = 'DESC'; // domyślnie malejąco (najnowsze pierwsze)
}
