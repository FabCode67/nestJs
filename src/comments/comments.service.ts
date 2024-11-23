import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  async create(
    userId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const blog = await this.blogRepository.findOne({
      where: { id: createCommentDto.blogId },
    });
    if (!blog) {
      throw new NotFoundException(
        `Blog with ID ${createCommentDto.blogId} not found`,
      );
    }

    const comment = this.commentRepository.create({
      content: createCommentDto.content,
      author: user,
      blog: blog,
    });

    return this.commentRepository.save(comment);
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });

    if (!comment) {
      throw new NotFoundException(`Comment with ID ${commentId} not found`);
    }

    if (comment.author.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }

    await this.commentRepository.delete(commentId);
  }
}
