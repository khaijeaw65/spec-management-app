import { IAuthService } from '../interfaces/auth.service.interface';

export class MockAuthService implements IAuthService {
  login = jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'mock-id',
      name: 'Test User',
      email: 'test@test.com',
    },
  });
  refresh = jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'mock-id',
      name: 'Test User',
      email: 'test@test.com',
    },
  });
  register = jest.fn().mockResolvedValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: 'mock-id',
      name: 'Test User',
      email: 'test@test.com',
    },
  });
  getProfile = jest.fn().mockResolvedValue({
    id: 'mock-id',
    name: 'Test User',
    email: 'test@test.com',
  });
}
