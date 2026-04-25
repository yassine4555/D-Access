import { IsIn, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsIn(['user', 'admin', 'moderator'])
  role: string;
}
