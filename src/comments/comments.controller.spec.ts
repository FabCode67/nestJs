import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { AuthGuard } from '../auth/auth.guard';

describe('CommentsController', () => {
  let controller: CommentsController;
  let mockCommentsService: Partial<CommentsService>;
  const mockComment: Comment = {
    id: 'test-comment-id',
    content: 'Test comment content',
    createdAt: new Date(),
    author: { id: 'author-id', name: 'Author Name' } as any,
    blog: { id: 'blog-id', title: 'Blog Title' } as any,
  };
  const mockRequest = {
    user: {
      id: 'user-id-1',
    },
  };
  beforeEach(async () => {
    mockCommentsService = {
      create: jest.fn(),
      deleteComment: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();
    controller = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comment', async () => {
      const createCommentDto: CreateCommentDto = {
        content: 'Test comment content',
        blogId: 'blog-id-1',
      };
      (mockCommentsService.create as jest.Mock).mockResolvedValue(mockComment);
      const result = await controller.create(
        createCommentDto,
        mockRequest as any,
      );
      expect(mockCommentsService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createCommentDto,
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment', async () => {
      const commentId = 'test-comment-id';

      // Mock the service method
      (mockCommentsService.deleteComment as jest.Mock).mockResolvedValue(
        undefined,
      );

      // Call controller method
      await controller.deleteComment(commentId, mockRequest as any);

      // Assertions
      expect(mockCommentsService.deleteComment).toHaveBeenCalledWith(
        commentId,
        mockRequest.user.id,
      );
    });
  });
});
