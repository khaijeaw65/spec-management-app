import { IInternalJwtService } from '../interfaces/jwt.interface';

export class JwtServiceMock implements IInternalJwtService {
  sign = jest.fn().mockReturnValue('mock-token');

  verify = jest.fn().mockReturnValue({ sub: 'mock-sub' });
}
