import { IUserService } from '../interfaces/user.interface';

export class UserServiceMock implements IUserService {
  getByEmail = jest
    .fn()
    .mockReturnValue({ id: 'mock-id', email: 'mock-email' });
  getByEmailWithPassword = jest.fn().mockResolvedValue({
    id: 'mock-id',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    password: 'hashed-password',
    isActive: true,
  });
  getById = jest.fn().mockResolvedValue({
    id: 'mock-id',
    email: 'mock-email',
    firstName: 'Mock',
    lastName: 'User',
  });
  create = jest.fn().mockReturnValue({ id: 'mock-id', email: 'mock-email' });
  update = jest.fn().mockReturnValue(undefined);
  delete = jest.fn().mockReturnValue(undefined);
}
