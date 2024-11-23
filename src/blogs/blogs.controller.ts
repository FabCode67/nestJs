import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Blog } from './entities/blog.entity';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createBlogDto: CreateBlogDto, @Req() req): Promise<Blog> {
    const authorId = req.user.id;
    return this.blogsService.create(createBlogDto, authorId);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Patch(':id/like')
  likeBlog(@Param('id') blogId: string, @Req() req): Promise<Blog> {
    const userId = req.user.id;
    return this.blogsService.likeBlog(userId, blogId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/unlike')
  unlikeBlog(@Param('id') blogId: string, @Req() req): Promise<Blog> {
    const userId = req.user.id;
    return this.blogsService.unlikeBlog(userId, blogId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/bookmark')
  bookmarkBlog(@Param('id') blogId: string, @Req() req): Promise<Blog> {
    const userId = req.user.id;
    return this.blogsService.bookmarkBlog(userId, blogId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/unbookmark')
  unbookmarkBlog(@Param('id') blogId: string, @Req() req): Promise<Blog> {
    const userId = req.user.id;
    return this.blogsService.unbookmarkBlog(userId, blogId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @Req() req,
  ): Promise<Blog> {
    const authorId = req.user.id;
    return this.blogsService.update(id, updateBlogDto, authorId);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
