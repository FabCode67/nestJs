import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: Partial<UsersService>;
  const mockUser: User = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
    roles: ['user'],
    password: 'password123',
    blogs: [],
    likedBlogs: [],
    bookmarkedBlogs: [],
    comments: [],
  };

  beforeEach(async () => {
    mockUsersService = {
      createUser: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        roles: ['user'],
      };

      // Mock the service method
      (mockUsersService.createUser as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.create(createUserDto);

      expect(mockUsersService.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];

      // Mock the service method
      (mockUsersService.findAll as jest.Mock).mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user by id', async () => {
      // Mock the service method
      (mockUsersService.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      const updatedUser = { ...mockUser, ...updateUserDto };

      // Mock the service method
      (mockUsersService.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await controller.update(mockUser.id, updateUserDto);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser.id,
        updateUserDto,
      );
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const mockDeleteResult = {
        raw: {},
        affected: 1,
      };

      // Mock the service method
      (mockUsersService.remove as jest.Mock).mockResolvedValue(
        mockDeleteResult,
      );

      const result = await controller.remove(mockUser.id);

      expect(mockUsersService.remove).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockDeleteResult);
    });
  });
});
