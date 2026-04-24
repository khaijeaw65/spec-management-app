import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../../../entities/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { IUserRepository } from './user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({
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
    return this.repo.findOne({
      where: { email, isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        password: true,
      },
    });
  }

  async findById(id: string) {
    return this.repo.findOne({
      where: { id, isActive: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });
  }

  async create(user: DeepPartial<UserEntity>) {
    return this.repo.save(user);
  }

  async update(user: DeepPartial<UserEntity>) {
    return this.repo.save(user);
  }

  async delete(id: string) {
    return await this.repo.delete({
      id,
      isActive: true,
    });
  }

  async softDelete(id: string) {
    return await this.repo.update(id, { isActive: false });
  }
}
