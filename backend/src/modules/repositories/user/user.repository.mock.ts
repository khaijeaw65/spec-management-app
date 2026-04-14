import { IUserRepository } from './user.repository.interface';

export class MockUserRepository implements IUserRepository {
  findByEmail = jest
    .fn()
    .mockReturnValue({ id: 'mock-id', email: 'mock-email' });
  findByEmailWithPassword = jest.fn().mockReturnValue({
    id: 'mock-id',
    email: 'mock-email',
    password: 'mock-password',
  });
  findById = jest.fn().mockReturnValue({ id: 'mock-id', email: 'mock-email' });
  create = jest.fn().mockReturnValue({ id: 'mock-id', email: 'mock-email' });
  update = jest.fn().mockReturnValue(undefined);
  delete = jest.fn().mockReturnValue({ affected: 1 });
  softDelete = jest.fn().mockReturnValue({ affected: 1 });
}
