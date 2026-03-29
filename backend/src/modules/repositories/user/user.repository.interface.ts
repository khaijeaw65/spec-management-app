import { UserEntity } from 'src/entities/user.entity';
import { DeepPartial } from 'typeorm';

export abstract class IUserRepository {
  abstract findByEmail(email: string): Promise<UserEntity | null>;
  abstract findByEmailWithPassword(email: string): Promise<UserEntity | null>;
  abstract findById(id: string): Promise<UserEntity | null>;
  abstract create(user: DeepPartial<UserEntity>): Promise<UserEntity>;
  abstract update(user: DeepPartial<UserEntity>): Promise<UserEntity>;
  abstract delete(id: string): Promise<void>;
  abstract softDelete(id: string): Promise<void>;
}
