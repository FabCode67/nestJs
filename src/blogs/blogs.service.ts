import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createBlogDto: CreateBlogDto, authorId: string): Promise<Blog> {
    const author = await this.userRepository.findOne({
      where: { id: authorId },
    });

    if (!author) {
      throw new NotFoundException(`User with ID ${authorId} not found`);
    }

    const { categoryIds } = createBlogDto;

    if (!categoryIds || categoryIds.length === 0) {
      throw new BadRequestException(`Blog must have at least one category`);
    }

    const categories = await this.categoryRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException(`One or more categories not found`);
    }

    const blog = this.blogRepository.create({
      ...createBlogDto,
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
      throw new BadRequestException(`You have already liked this blog`);
    }

    blog.likedBy.push(user);
    blog.likesCount += 1;

    return this.blogRepository.save(blog);
  }

  async unlikeBlog(userId: string, blogId: string): Promise<Blog> {
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

    const likedIndex = blog.likedBy.findIndex((u) => u.id === userId);

    if (likedIndex === -1) {
      throw new BadRequestException(`You have not liked this blog`);
    }

    blog.likedBy.splice(likedIndex, 1);
    blog.likesCount = Math.max(0, blog.likesCount - 1);

    return this.blogRepository.save(blog);
  }

  async bookmarkBlog(userId: string, blogId: string): Promise<Blog> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarkedBlogs'],
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const blog = await this.blogRepository.findOne({ where: { id: blogId } });

    if (!blog) {
      throw new NotFoundException(`Blog with ID ${blogId} not found`);
    }

    const alreadyBookmarked = user.bookmarkedBlogs.some((b) => b.id === blogId);

    if (alreadyBookmarked) {
      throw new BadRequestException(`Blog already bookmarked by this user`);
    }

    user.bookmarkedBlogs.push(blog);

    await this.userRepository.save(user);

    return blog;
  }

  async unbookmarkBlog(userId: string, blogId: string): Promise<Blog> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['bookmarkedBlogs'],
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    const blogIndex = user.bookmarkedBlogs.findIndex((b) => b.id === blogId);

    if (blogIndex === -1) {
      throw new BadRequestException(`Blog is not bookmarked by this user`);
    }

    const [removedBlog] = user.bookmarkedBlogs.splice(blogIndex, 1);

    await this.userRepository.save(user);

    return removedBlog;
  }

  findAll() {
    return this.blogRepository.find();
  }

  async findOne(id: string) {
    const existingBlog = await this.blogRepository.findOneBy({ id });
    if (!existingBlog) throw new BadRequestException('blog not found');
    return this.blogRepository.findOneBy({ id });
  }

  async update(
    id: string,
    updateBlogDto: UpdateBlogDto,
    authorId: string,
  ): Promise<Blog> {
    const existingBlog = await this.blogRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!existingBlog) {
      throw new NotFoundException('Blog not found');
    }
    if (existingBlog.author.id !== authorId) {
      throw new BadRequestException(
        'You are not authorized to update this blog',
      );
    }
    if (updateBlogDto.categoryIds && updateBlogDto.categoryIds.length > 0) {
      const categories = await this.categoryRepository.findByIds(
        updateBlogDto.categoryIds,
      );
      if (categories.length !== updateBlogDto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }
      existingBlog.categories = categories;
    }
    const updatedBlog = this.blogRepository.merge(existingBlog, updateBlogDto);
    return this.blogRepository.save(updatedBlog);
  }

  async remove(id: string) {
    const existingBlog = await this.blogRepository.findOneBy({ id });
    if (!existingBlog) throw new BadRequestException('blog not found');
    return this.blogRepository.delete({ id });
  }
}
