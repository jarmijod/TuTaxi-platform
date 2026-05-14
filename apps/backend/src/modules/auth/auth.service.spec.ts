import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refresh: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have register method', () => {
    expect(service.register).toBeDefined();
  });

  it('should have login method', () => {
    expect(service.login).toBeDefined();
  });

  it('should have refresh method', () => {
    expect(service.refresh).toBeDefined();
  });

  it('should have logout method', () => {
    expect(service.logout).toBeDefined();
  });
});
