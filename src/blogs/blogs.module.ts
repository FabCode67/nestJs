import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, Category, User])],
  controllers: [BlogsController],
  providers: [BlogsService],
})
export class BlogsModule {}
