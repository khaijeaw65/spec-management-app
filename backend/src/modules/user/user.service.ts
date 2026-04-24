import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IUserRepository } from '../repositories/user/user.repository.interface';
import type { RegisterDto, UpdateUserDto } from '@spec-app/schemas';
import bcrypt from 'bcrypt';
import { IUserService } from './interfaces/user.interface';

@Injectable()
export class UserService implements IUserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getById(id: string) {
    const user = await this.userRepository.findById(id);

    return user;
  }

  async getByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async getByEmailWithPassword(email: string) {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async create(user: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(user.email);
    if (existingUser) {
      throw new BadRequestException('Email already in use');
    }

    const createdUser = await this.userRepository.create({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: await bcrypt.hash(user.password, 10),
      isActive: true,
    });

    return createdUser;
  }

  async update(id: string, user: UpdateUserDto) {
    const existingUser = await this.getById(id);

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    if (user.password) {
      existingUser.password = await bcrypt.hash(user.password, 10);
    }

    await this.userRepository.update({
      ...existingUser,
      ...user,
    });
  }

  async delete(id: string) {
    const existingUser = await this.getById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.softDelete(id);
  }
}
