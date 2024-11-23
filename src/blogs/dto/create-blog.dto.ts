import {
  IsNotEmpty,
  IsString,
  IsUUID,
  ArrayNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateBlogDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('all', { each: true })
  categoryIds: string[];
}
