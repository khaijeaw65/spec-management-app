import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../repositories/user/user.repository.interface';
import type { RegisterDto } from '@spec-app/schemas';
import bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async getUserByEmailWithPassword(email: string) {
    return this.userRepository.findByEmailWithPassword(email);
  }

  async createUser(user: RegisterDto) {
    const createdUser = await this.userRepository.create({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      password: await bcrypt.hash(user.password, 10),
      isActive: true,
    });

    return createdUser;
  }
}
