import { Test, TestingModule } from '@nestjs/testing';
import { BlogsController } from './blogs.controller';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { AuthGuard } from '../auth/auth.guard';

describe('BlogsController', () => {
  let controller: BlogsController;
  let mockBlogsService: Partial<BlogsService>;
  const mockUser = { id: 'test-user-id' };
  const mockBlog: Blog = {
    id: 'test-blog-id',
    title: 'Test Blog',
    content: 'Test Content',
    author: { id: mockUser.id } as any,
    categories: [],
    comments: [],
    likesCount: 0,
    likedBy: [],
    bookmarkedBy: [],
  };

  beforeEach(async () => {
    mockBlogsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      likeBlog: jest.fn(),
      unlikeBlog: jest.fn(),
      bookmarkBlog: jest.fn(),
      unbookmarkBlog: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BlogsController],
      providers: [
        {
          provide: BlogsService,
          useValue: mockBlogsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<BlogsController>(BlogsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new blog', async () => {
      const createBlogDto: CreateBlogDto = {
        title: 'Test Blog',
        content: 'Test Content',
        categoryIds: [],
      };

      const mockRequest = { user: mockUser };
      (mockBlogsService.create as jest.Mock).mockResolvedValue(mockBlog);
      const result = await controller.create(createBlogDto, mockRequest as any);
      expect(mockBlogsService.create).toHaveBeenCalledWith(
        createBlogDto,
        mockUser.id,
      );
      expect(result).toEqual(mockBlog);
    });
  });

  describe('findAll', () => {
    it('should return an array of blogs', async () => {
      const mockBlogs = [mockBlog];

      (mockBlogsService.findAll as jest.Mock).mockResolvedValue(mockBlogs);

      const result = await controller.findAll();

      expect(mockBlogsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockBlogs);
    });
  });

  describe('findOne', () => {
    it('should return a single blog by id', async () => {
      (mockBlogsService.findOne as jest.Mock).mockResolvedValue(mockBlog);

      const result = await controller.findOne(mockBlog.id);

      expect(mockBlogsService.findOne).toHaveBeenCalledWith(mockBlog.id);
      expect(result).toEqual(mockBlog);
    });
  });

  describe('update', () => {
    it('should update a blog', async () => {
      const updateBlogDto: UpdateBlogDto = {
        title: 'Updated Blog Title',
      };

      const updatedBlog = { ...mockBlog, ...updateBlogDto };
      const mockRequest = { user: mockUser };
      (mockBlogsService.update as jest.Mock).mockResolvedValue(updatedBlog);
      const result = await controller.update(
        mockBlog.id,
        updateBlogDto,
        mockRequest as any,
      );

      expect(mockBlogsService.update).toHaveBeenCalledWith(
        mockBlog.id,
        updateBlogDto,
        mockUser.id,
      );
      expect(result).toEqual(updatedBlog);
    });
  });

  describe('remove', () => {
    it('should remove a blog', async () => {
      const mockDeleteResult = {
        raw: {},
        affected: 1,
      };

      (mockBlogsService.remove as jest.Mock).mockResolvedValue(
        mockDeleteResult,
      );
      const result = await controller.remove(mockBlog.id);
      expect(mockBlogsService.remove).toHaveBeenCalledWith(mockBlog.id);
      expect(result).toEqual(mockDeleteResult);
    });
  });

  describe('likeBlog', () => {
    it('should like a blog', async () => {
      const mockRequest = { user: mockUser };
      const likedBlog = { ...mockBlog, likes: [mockUser.id] };
      (mockBlogsService.likeBlog as jest.Mock).mockResolvedValue(likedBlog);
      const result = await controller.likeBlog(mockBlog.id, mockRequest as any);
      expect(mockBlogsService.likeBlog).toHaveBeenCalledWith(
        mockUser.id,
        mockBlog.id,
      );
      expect(result).toEqual(likedBlog);
    });
  });

  describe('unlikeBlog', () => {
    it('should unlike a blog', async () => {
      const mockRequest = { user: mockUser };
      const unlikedBlog = { ...mockBlog, likes: [] };

      (mockBlogsService.unlikeBlog as jest.Mock).mockResolvedValue(unlikedBlog);
      const result = await controller.unlikeBlog(
        mockBlog.id,
        mockRequest as any,
      );
      expect(mockBlogsService.unlikeBlog).toHaveBeenCalledWith(
        mockUser.id,
        mockBlog.id,
      );
      expect(result).toEqual(unlikedBlog);
    });
  });

  describe('bookmarkBlog', () => {
    it('should bookmark a blog', async () => {
      const mockRequest = { user: mockUser };
      const bookmarkedBlog = { ...mockBlog, bookmarks: [mockUser.id] };

      (mockBlogsService.bookmarkBlog as jest.Mock).mockResolvedValue(
        bookmarkedBlog,
      );
      const result = await controller.bookmarkBlog(
        mockBlog.id,
        mockRequest as any,
      );
      expect(mockBlogsService.bookmarkBlog).toHaveBeenCalledWith(
        mockUser.id,
        mockBlog.id,
      );
      expect(result).toEqual(bookmarkedBlog);
    });
  });

  describe('unbookmarkBlog', () => {
    it('should unbookmark a blog', async () => {
      const mockRequest = { user: mockUser };
      const unbookmarkedBlog = { ...mockBlog, bookmarks: [] };
      (mockBlogsService.unbookmarkBlog as jest.Mock).mockResolvedValue(
        unbookmarkedBlog,
      );
      const result = await controller.unbookmarkBlog(
        mockBlog.id,
        mockRequest as any,
      );
      expect(mockBlogsService.unbookmarkBlog).toHaveBeenCalledWith(
        mockUser.id,
        mockBlog.id,
      );
      expect(result).toEqual(unbookmarkedBlog);
    });
  });
});
