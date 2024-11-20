import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const { authorId, categoryIds, title, content } = createBlogDto;
    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException(`User with ID ${authorId} not found`);
    }

    const categories = await this.categoryRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException(`One or more categories not found`);
    }

    const blog = this.blogRepository.create({
      title,
      content,
      author,
      categories,
    });

    return this.blogRepository.save(blog);
  }

  async likeBlog(userId: string, blogId: string): Promise<Blog> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
      relations: ['likedBy'],
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const alreadyLiked = blog.likedBy.some((u) => u.id === userId);

    if (alreadyLiked) {
      throw new BadRequestException(`User already liked this blog`);
    }

    blog.likedBy.push(user);
    blog.likesCount += 1;

    return this.blogRepository.save(blog);
  }

  async unlikeBlog(userId: string, blogId: string): Promise<Blog> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const blog = await this.blogRepository.findOne({
      where: { id: blogId },
      relations: ['likedBy'],
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const likedIndex = blog.likedBy.findIndex((u) => u.id === userId);

    if (likedIndex === -1) {
      throw new BadRequestException(`User has not liked this blog`);
    }

    blog.likedBy.splice(likedIndex, 1);
    blog.likesCount = Math.max(0, blog.likesCount - 1);

    return this.blogRepository.save(blog);
  }

  findAll() {
    return this.blogRepository.find();
  }

  async findOne(id: string) {
    const existingBlog = await this.blogRepository.findOneBy({ id });
    if (!existingBlog) throw new BadRequestException('blog not found');
    return this.blogRepository.findOneBy({ id });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const existingBlog = await this.blogRepository.findOneBy({ id });
    if (!existingBlog) throw new BadRequestException('blog not found');
    const blog = await this.blogRepository.preload({
      id,
      ...updateBlogDto,
    });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${id} not found`);
    }

    return this.blogRepository.save(blog);
  }

  async remove(id: string) {
    const existingBlog = await this.blogRepository.findOneBy({ id });
    if (!existingBlog) throw new BadRequestException('blog not found');
    return this.blogRepository.delete({ id });
  }
}
