import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { User } from '../users/entities/user.entity';
import { Blog } from '../blogs/entities/blog.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, User, Blog])],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
