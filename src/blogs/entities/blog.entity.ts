import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Comment } from '../../comments/entities/comment.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @Column({ default: 0 })
  likesCount: number;

  @ManyToOne(() => User, (user) => user.blogs)
  author: User;

  @ManyToMany(() => User, (user) => user.likedBlogs)
  likedBy: User[];

  @ManyToMany(() => User, (user) => user.bookmarkedBlogs)
  bookmarkedBy: User[];

  @ManyToMany(() => Category, (category) => category.blogs)
  @JoinTable()
  categories: Category[];

  @OneToMany(() => Comment, (comment) => comment.blog)
  comments: Comment[];
}
