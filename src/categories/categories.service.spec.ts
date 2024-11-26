import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockCategoryRepository: Partial<Repository<Category>>;

  beforeEach(async () => {
    mockCategoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      preload: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  // Test create method
  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = { name: 'Test Category' };
      mockCategoryRepository.findOne = jest.fn().mockResolvedValue(null);

      const mockCategory = { id: '1', ...createCategoryDto };
      mockCategoryRepository.create = jest.fn().mockReturnValue(mockCategory);
      mockCategoryRepository.save = jest.fn().mockResolvedValue(mockCategory);
      const result = await service.create(createCategoryDto);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(
        createCategoryDto,
      );
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });

    it('should throw BadRequestException if category already exists', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Existing Category',
      };
      mockCategoryRepository.findOne = jest.fn().mockResolvedValue({
        id: '1',
        name: 'Existing Category',
      });

      await expect(service.create(createCategoryDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [
        { id: '1', name: 'Category 1' },
        { id: '2', name: 'Category 2' },
      ];
      mockCategoryRepository.find = jest.fn().mockResolvedValue(mockCategories);

      const result = await service.findAll();

      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a category by id', async () => {
      const mockCategory = { id: '1', name: 'Test Category' };
      mockCategoryRepository.findOneBy = jest
        .fn()
        .mockResolvedValue(mockCategory);

      const result = await service.findOne('1');

      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
      });
    });

    it('should throw NotFoundException if category not found', async () => {
      mockCategoryRepository.findOneBy = jest.fn().mockResolvedValue(null);

      try {
        await service.findOne('999');
        fail('Should have thrown NotFoundException');
      } catch (error) {
        console.log(error);
      }
    });
  });

  describe('update', () => {
    it('should update an existing category', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      const existingCategory = { id: '1', name: 'Original Category' };
      const updatedCategory = { id: '1', ...updateCategoryDto };
      mockCategoryRepository.findOneBy = jest
        .fn()
        .mockResolvedValue(existingCategory);
      mockCategoryRepository.preload = jest
        .fn()
        .mockResolvedValue(updatedCategory);
      mockCategoryRepository.save = jest
        .fn()
        .mockResolvedValue(updatedCategory);
      const result = await service.update('1', updateCategoryDto);
      expect(mockCategoryRepository.findOneBy).toHaveBeenCalledWith({
        id: '1',
      });
      expect(mockCategoryRepository.preload).toHaveBeenCalledWith({
        id: '1',
        ...updateCategoryDto,
      });
      expect(mockCategoryRepository.save).toHaveBeenCalledWith(updatedCategory);
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException if category does not exist', async () => {
      const updateCategoryDto: UpdateCategoryDto = { name: 'Updated Category' };
      mockCategoryRepository.findOneBy = jest.fn().mockResolvedValue(null);
      try {
        await service.update('999', updateCategoryDto);
        fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      const existingCategory = { id: '1', name: 'Test Category' };
      mockCategoryRepository.findOneBy = jest
        .fn()
        .mockResolvedValue(existingCategory);
      mockCategoryRepository.delete = jest
        .fn()
        .mockResolvedValue({ affected: 1 });
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockCategoryRepository.findOneBy = jest.fn().mockResolvedValue(null);
      try {
        await service.remove('999');
        fail('Should have thrown NotFoundException');
      } catch (error) {
        console.log(error);
      }
    });
  });
});
