import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });
  }

  async findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        isActive: true,
        password: true,
      },
    });
  }

  async findById(id: string) {
    return this.userRepository.findOne({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async create(user: UserEntity) {
    return this.userRepository.save(user);
  }

  async update(user: UserEntity) {
    return this.userRepository.save(user);
  }

  async delete(id: string) {
    await this.userRepository.delete({
      id,
      isActive: true,
    });
  }

  async softDelete(id: string) {
    await this.userRepository.update(id, { isActive: false });
  }
}
