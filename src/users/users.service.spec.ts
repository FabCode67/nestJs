import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DeleteResult, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: Partial<Repository<User>>;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOneBy: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('Users', () => {
    const mockCreateUserDto: CreateUserDto = {
      email: 'test@example.com',
      fullName: 'Test User',
      password: 'password123',
      roles: ['user'],
    };

    const userId = 'existing-user-id';
    const updateUserDto: UpdateUserDto = {
      fullName: 'Updated Name',
      email: 'updated@example.com',
    };

    it('should successfully create a new user', async () => {
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(null);
      const mockCreatedUser = { ...mockCreateUserDto, id: 'test-id' };
      (mockUserRepository.create as jest.Mock).mockReturnValue(mockCreatedUser);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(mockCreatedUser);
      const result = await service.createUser(mockCreateUserDto);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockCreatedUser);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const existingUser = { id: 'existing-id', ...mockCreateUserDto };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(existingUser);
      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createUser(mockCreateUserDto)).rejects.toThrow(
        'Email is already in use.',
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: mockCreateUserDto.email },
      });
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should list all users', async () => {
      const users = await service.findAll();
      expect(users).toEqual([]);
    });

    it('should find a user by email', async () => {
      const mockUser = { id: 'test-id', ...mockCreateUserDto };
      (mockUserRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findByEmail('fabrice@gmail.com');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'fabrice@gmail.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should find a user by id', async () => {
      const mockUser = { id: 'test-id', ...mockCreateUserDto };
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
      const result = await service.findOne('test-id');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: 'test-id',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestException if user not found', async () => {
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne('test-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne('test-id')).rejects.toThrow(
        'User not found',
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: 'test-id',
      });
    });

    it('should successfully update an existing user', async () => {
      const existingUser = {
        id: userId,
        name: 'Original Name',
        email: 'original@example.com',
      };
      const updatedUser = {
        ...existingUser,
        ...updateUserDto,
      };
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(
        existingUser,
      );
      (mockUserRepository.preload as jest.Mock).mockResolvedValue(updatedUser);
      (mockUserRepository.save as jest.Mock).mockResolvedValue(updatedUser);
      const result = await service.update(userId, updateUserDto);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.preload).toHaveBeenCalledWith({
        id: userId,
        ...updateUserDto,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw BadRequestException when user is not found', async () => {
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        'User not found',
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.preload).not.toHaveBeenCalled();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when preload fails', async () => {
      const existingUser = {
        id: userId,
        name: 'Original Name',
        email: 'original@example.com',
      };
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(
        existingUser,
      );
      (mockUserRepository.preload as jest.Mock).mockResolvedValue(null);
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        `User with ID ${userId} not found`,
      );
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.preload).toHaveBeenCalledWith({
        id: userId,
        ...updateUserDto,
      });
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should successfully remove an existing user', async () => {
      const existingUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };

      const mockDeleteResult: DeleteResult = {
        raw: {},
        affected: 1,
      };
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(
        existingUser,
      );
      (mockUserRepository.delete as jest.Mock).mockResolvedValue(
        mockDeleteResult,
      );
      const result = await service.remove(userId);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.delete).toHaveBeenCalledWith({ id: userId });
      expect(result).toEqual(mockDeleteResult);
    });

    it('should throw NotFoundException when user is not found', async () => {
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(null);
      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(userId)).rejects.toThrow('User not found');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
      expect(mockUserRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle delete operation result', async () => {
      const existingUser = {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      };
      const completeDeleteResult: DeleteResult = {
        raw: {},
        affected: 1,
      };
      const partialDeleteResult: DeleteResult = {
        raw: {},
        affected: 0,
      };
      (mockUserRepository.findOneBy as jest.Mock).mockResolvedValue(
        existingUser,
      );
      (mockUserRepository.delete as jest.Mock).mockResolvedValue(
        completeDeleteResult,
      );
      const completeResult = await service.remove(userId);
      expect(completeResult.affected).toBe(1);
      (mockUserRepository.delete as jest.Mock).mockResolvedValue(
        partialDeleteResult,
      );
      const partialResult = await service.remove(userId);
      expect(partialResult.affected).toBe(0);
    });
  });
});
