import {
  IsOptional,
  IsArray,
  IsString,
  IsInt,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsInt()
  id?: number;

  @IsString()
  @IsUUID()
  user_id: string;

  @IsString()
  public_key: string;

  @IsString()
  private_key: string;

  @IsOptional()
  @IsDateString()
  created_at?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favs?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categories?: string[];
}
