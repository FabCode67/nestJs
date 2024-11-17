import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Blog } from '../../blogs/entities/blog.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToMany(() => Blog, (blog) => blog.categories)
  blogs: Blog[];
}
