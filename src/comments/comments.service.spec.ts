import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepository: Repository<Comment>;
  let userRepository: Repository<User>;
  let blogRepository: Repository<Blog>;

  // Mock objects
  const mockUser: User = {
    id: 'test-user-id',
    fullName: 'Test User',
    email: 'test@example.com',
  } as User;

  const mockBlog: Blog = {
    id: 'test-blog-id',
    title: 'Test Blog',
    content: 'Test Content',
  } as Blog;

  const mockComment: Comment = {
    id: 'test-comment-id',
    content: 'Test Comment',
    author: mockUser,
    blog: mockBlog,
  } as Comment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Blog),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepository = module.get<Repository<Comment>>(
      getRepositoryToken(Comment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    blogRepository = module.get<Repository<Blog>>(getRepositoryToken(Blog));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        blogId: mockBlog.id,
      };

      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      (blogRepository.findOne as jest.Mock).mockResolvedValue(mockBlog);

      (commentRepository.create as jest.Mock).mockReturnValue(mockComment);
      (commentRepository.save as jest.Mock).mockResolvedValue(mockComment);

      const result = await service.create(mockUser.id, createCommentDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(blogRepository.findOne).toHaveBeenCalledWith({
        where: { id: createCommentDto.blogId },
      });
      expect(commentRepository.create).toHaveBeenCalledWith({
        content: createCommentDto.content,
        author: mockUser,
        blog: mockBlog,
      });
      expect(result).toEqual(mockComment);
    });

    it('should throw NotFoundException if user not found', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        blogId: mockBlog.id,
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create('non-existent-user-id', createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if blog not found', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test Comment',
        blogId: 'non-existent-blog-id',
      };
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
      (blogRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.create(mockUser.id, createCommentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('should successfully delete a comment by its author', async () => {
      (commentRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockComment,
        author: mockUser,
      });
      (commentRepository.delete as jest.Mock).mockResolvedValue({
        affected: 1,
      });

      await expect(
        service.deleteComment(mockComment.id, mockUser.id),
      ).resolves.toBeUndefined();

      expect(commentRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockComment.id },
        relations: ['author'],
      });
      expect(commentRepository.delete).toHaveBeenCalledWith(mockComment.id);
    });

    it('should throw NotFoundException if comment not found', async () => {
      (commentRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(
        service.deleteComment('non-existent-comment-id', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the comment author', async () => {
      const differentUser = { ...mockUser, id: 'different-user-id' };
      (commentRepository.findOne as jest.Mock).mockResolvedValue({
        ...mockComment,
        author: differentUser,
      });

      await expect(
        service.deleteComment(mockComment.id, mockUser.id),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
