import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Comment } from './entities/comment.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createCommentDto: CreateCommentDto,
    @Req() req,
  ): Promise<Comment> {
    const userId = req.user.id;
    return this.commentsService.create(userId, createCommentDto);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @Req() req,
  ): Promise<void> {
    const userId = req.user.id;
    await this.commentsService.deleteComment(commentId, userId);
  }
}
