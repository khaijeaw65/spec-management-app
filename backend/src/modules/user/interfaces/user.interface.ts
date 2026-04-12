import { RegisterDto, UpdateUserDto } from '@spec-app/schemas';
import { UserEntity } from '../../../entities/user.entity';

export abstract class IUserService {
  abstract getByEmail(email: string): Promise<UserEntity | null>;
  abstract getByEmailWithPassword(email: string): Promise<UserEntity | null>;
  abstract getById(id: string): Promise<UserEntity | null>;
  abstract create(user: RegisterDto): Promise<UserEntity>;
  abstract update(id: string, user: UpdateUserDto): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
