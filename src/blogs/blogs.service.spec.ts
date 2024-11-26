import { Test, TestingModule } from '@nestjs/testing';
import { BlogsService } from './blogs.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BlogsService', () => {
  let service: BlogsService;
  let blogRepository: Repository<Blog>;
  let userRepository: Repository<User>;
  let categoryRepository: Repository<Category>;

  const mockUser: User = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
    bookmarkedBlogs: [],
  } as User;

  const mockCategory: Category = {
    id: 'test-category-id',
    name: 'Test Category',
  } as Category;

  const mockBlog: Blog = {
    id: 'test-blog-id',
    title: 'Test Blog',
    content: 'Test Content',
    author: mockUser,
    likedBy: [],
    likesCount: 0,
    categories: [mockCategory],
  } as Blog;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogsService,
        {
          provide: getRepositoryToken(Blog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            merge: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Category),
          useValue: {
            findByIds: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BlogsService>(BlogsService);
    blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'New Blog',
        content: 'New Content',
        categoryIds: ['test-category-id'],
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (categoryRepository.findByIds as jest.Mock).mockResolvedValue([
        mockCategory,
      ]);
      (blogRepository.create as jest.Mock).mockReturnValue(mockBlog);
      (blogRepository.save as jest.Mock).mockResolvedValue(mockBlog);

      const result = await service.create(createBlogDto, mockUser.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(categoryRepository.findByIds).toHaveBeenCalledWith(
        createBlogDto.categoryIds,
      );
      expect(blogRepository.create).toHaveBeenCalledWith({
        ...createBlogDto,
        author: mockUser,
        categories: [mockCategory],
      });
      expect(result).toEqual(mockBlog);
    });

    it('should throw NotFoundException if category not found', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'New Blog',
        content: 'New Content',
        categoryIds: ['non-existent-category-id'],
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (categoryRepository.findByIds as jest.Mock).mockResolvedValue([]);

      await expect(service.create(createBlogDto, mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if no categories provided', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'New Blog',
        content: 'New Content',
        categoryIds: [],
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      await expect(service.create(createBlogDto, mockUser.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('likeBlog', () => {
    it('should like a blog', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (blogRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockBlog,
        likedBy: [],
        likesCount: 0,
      });
      (blogRepository.save as jest.Mock).mockResolvedValue({
        ...mockBlog,
        likedBy: [mockUser],
        likesCount: 1,
      });

      const result = await service.likeBlog(mockUser.id, mockBlog.id);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBlog.id },
        relations: ['likedBy'],
      });
      expect(result.likedBy).toContain(mockUser);
      expect(result.likesCount).toBe(1);
    });

    it('should throw BadRequestException if already liked', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (blogRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockBlog,
        likedBy: [mockUser],
      });

      await expect(service.likeBlog(mockUser.id, mockBlog.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('unlikeBlog', () => {
    it('should unlike a blog', async () => {
      const likedBlog = {
        ...mockBlog,
        likedBy: [mockUser],
        likesCount: 1,
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (blogRepository.findOne as jest.Mock).mockResolvedValue(likedBlog);
      (blogRepository.save as jest.Mock).mockResolvedValue({
        ...likedBlog,
        likedBy: [],
        likesCount: 0,
      });

      const result = await service.unlikeBlog(mockUser.id, mockBlog.id);

      expect(result.likedBy).toHaveLength(0);
      expect(result.likesCount).toBe(0);
    });

    it('should throw BadRequestException if not liked', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (blogRepository.findOne as jest.Mock).mockResolvedValue(mockBlog);

      await expect(
        service.unlikeBlog(mockUser.id, mockBlog.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('bookmarkBlog', () => {
    it('should bookmark a blog', async () => {
      const userWithBookmarks = {
        ...mockUser,
        bookmarkedBlogs: [],
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(
        userWithBookmarks,
      );
      (blogRepository.findOne as jest.Mock).mockResolvedValue(mockBlog);
      (userRepository.save as jest.Mock).mockResolvedValue({
        ...userWithBookmarks,
        bookmarkedBlogs: [mockBlog],
      });

      const result = await service.bookmarkBlog(mockUser.id, mockBlog.id);

      expect(result).toEqual(mockBlog);
    });

    it('should throw BadRequestException if already bookmarked', async () => {
      const userWithBookmarks = {
        ...mockUser,
        bookmarkedBlogs: [mockBlog],
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(
        userWithBookmarks,
      );
      (blogRepository.findOne as jest.Mock).mockResolvedValue(mockBlog);

      await expect(
        service.bookmarkBlog(mockUser.id, mockBlog.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unbookmarkBlog', () => {
    it('should unbookmark a blog', async () => {
      const userWithBookmarks = {
        ...mockUser,
        bookmarkedBlogs: [mockBlog],
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(
        userWithBookmarks,
      );

      const result = await service.unbookmarkBlog(mockUser.id, mockBlog.id);

      expect(result).toEqual(mockBlog);
    });

    it('should throw BadRequestException if not bookmarked', async () => {
      const userWithBookmarks = {
        ...mockUser,
        bookmarkedBlogs: [],
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(
        userWithBookmarks,
      );

      await expect(
        service.unbookmarkBlog(mockUser.id, mockBlog.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all blogs', async () => {
      const mockBlogs = [mockBlog];
      (blogRepository.find as jest.Mock).mockResolvedValue(mockBlogs);

      const result = await service.findAll();

      expect(result).toEqual(mockBlogs);
    });
  });

  describe('findOne', () => {
    it('should find a blog by id', async () => {
      (blogRepository.findOneBy as jest.Mock).mockResolvedValue(mockBlog);

      const result = await service.findOne(mockBlog.id);

      expect(result).toEqual(mockBlog);
    });

    it('should throw BadRequestException if blog not found', async () => {
      (blogRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a blog', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog Title',
      };

      const existingBlog = {
        ...mockBlog,
        author: mockUser,
      };

      (blogRepository.findOne as jest.Mock).mockResolvedValue(existingBlog);
      (categoryRepository.findByIds as jest.Mock).mockResolvedValue([
        mockCategory,
      ]);
      (blogRepository.merge as jest.Mock).mockReturnValue({
        ...existingBlog,
        ...updateBlogDto,
      });
      (blogRepository.save as jest.Mock).mockResolvedValue({
        ...existingBlog,
        ...updateBlogDto,
      });

      const result = await service.update(
        mockBlog.id,
        updateBlogDto,
        mockUser.id,
      );

      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBlog.id },
        relations: ['author'],
      });
      expect(blogRepository.merge).toHaveBeenCalled();
      expect(result.title).toBe(updateBlogDto.title);
    });

    it('should throw BadRequestException if not blog author', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog Title',
      };

      const existingBlog = {
        ...mockBlog,
        author: { id: 'different-user-id' },
      };

      (blogRepository.findOne as jest.Mock).mockResolvedValue(existingBlog);

      await expect(
        service.update(mockBlog.id, updateBlogDto, mockUser.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a blog', async () => {
      (blogRepository.findOneBy as jest.Mock).mockResolvedValue(mockBlog);
      (blogRepository.delete as jest.Mock).mockResolvedValue({ affected: 1 });

      const result = await service.remove(mockBlog.id);

      expect(result).toBeDefined();
      expect(blogRepository.delete).toHaveBeenCalledWith({ id: mockBlog.id });
    });

    it('should throw BadRequestException if blog not found', async () => {
      (blogRepository.findOneBy as jest.Mock).mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
