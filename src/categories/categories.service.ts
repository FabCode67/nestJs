import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existingCategory = await this.categoryRepository.findOne({
      where: { name: CreateCategoryDto.name },
    });

    if (existingCategory) {
      throw new BadRequestException(`Category already in use`);
    }

    const category = this.categoryRepository.create(createCategoryDto);

    return this.categoryRepository.save(category);
  }

  findAll() {
    return this.categoryRepository.find();
  }

  findOne(id: string) {
    const existingCategory = this.categoryRepository.findOneBy({ id });
    if (!existingCategory) throw new NotFoundException('Category not found.');
    return this.categoryRepository.findOneBy({ id });
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const existingCategory = this.categoryRepository.findOneBy({ id });
    if (!existingCategory) throw new NotFoundException('Category not found.');
    const category = await this.categoryRepository.preload({
      id,
      ...updateCategoryDto,
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return this.categoryRepository.save(category);
  }

  remove(id: string) {
    const existingCategory = this.categoryRepository.findOneBy({ id });
    if (!existingCategory) throw new NotFoundException('Category not found.');
    return this.categoryRepository.delete({ id });
  }
}
