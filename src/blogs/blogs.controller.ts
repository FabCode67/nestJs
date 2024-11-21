import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('blogs')
export class BlogsController {
  constructor(private readonly blogsService: BlogsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createBlogDto: CreateBlogDto) {
    return this.blogsService.create(createBlogDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Patch(':id/like')
  likeBlog(@Param('id') blogId: string, @Body('userId') userId: string) {
    return this.blogsService.likeBlog(userId, blogId);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/unlike')
  unlikeBlog(@Param('id') blogId: string, @Body('userId') userId: string) {
    return this.blogsService.unlikeBlog(userId, blogId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogsService.update(id, updateBlogDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}
