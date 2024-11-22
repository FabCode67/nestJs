import { Blog } from '../../blogs/entities/blog.entity';
import { Comment } from '../../comments/entities/comment.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ type: 'simple-array', default: 'User' })
  roles: string[];

  @OneToMany(() => Blog, (blog) => blog.author)
  blogs: Blog[];

  @ManyToMany(() => Blog, (blog) => blog.likedBy)
  @JoinTable()
  likedBlogs: Blog[];

  @ManyToMany(() => Blog, (user) => user.bookmarkedBy)
  @JoinTable()
  bookmarkedBlogs: Blog[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments: Comment[];
}
