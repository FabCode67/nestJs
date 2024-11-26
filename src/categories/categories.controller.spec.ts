import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let mockCategoriesService: Partial<CategoriesService>;

  const mockCategory: Category = {
    id: 'test-category-id',
    name: 'Test Category',
    blogs: [], // Adjust based on your actual Category entity structure
  };

  beforeEach(async () => {
    mockCategoriesService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new category', async () => {
      const createCategoryDto: CreateCategoryDto = {
        name: 'Test Category',
      };

      // Mock the service method
      (mockCategoriesService.create as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      const result = await controller.create(createCategoryDto);

      expect(mockCategoriesService.create).toHaveBeenCalledWith(
        createCategoryDto,
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const mockCategories = [mockCategory];

      // Mock the service method
      (mockCategoriesService.findAll as jest.Mock).mockResolvedValue(
        mockCategories,
      );

      const result = await controller.findAll();

      expect(mockCategoriesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockCategories);
    });
  });

  describe('findOne', () => {
    it('should return a single category by id', async () => {
      // Mock the service method
      (mockCategoriesService.findOne as jest.Mock).mockResolvedValue(
        mockCategory,
      );

      const result = await controller.findOne(mockCategory.id);

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        mockCategory.id,
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updateCategoryDto: UpdateCategoryDto = {
        name: 'Updated Category Name',
      };

      const updatedCategory = { ...mockCategory, ...updateCategoryDto };

      // Mock the service method
      (mockCategoriesService.update as jest.Mock).mockResolvedValue(
        updatedCategory,
      );

      const result = await controller.update(
        mockCategory.id,
        updateCategoryDto,
      );

      expect(mockCategoriesService.update).toHaveBeenCalledWith(
        mockCategory.id,
        updateCategoryDto,
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const mockDeleteResult = {
        raw: {},
        affected: 1,
      };

      // Mock the service method
      (mockCategoriesService.remove as jest.Mock).mockResolvedValue(
        mockDeleteResult,
      );

      const result = await controller.remove(mockCategory.id);

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(
        mockCategory.id,
      );
      expect(result).toEqual(mockDeleteResult);
    });
  });
});
