import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Blog } from '../../blogs/entities/blog.entity';
  import { User } from '../../users/entities/user.entity';
  
  @Entity()
  export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('text')
    content: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @ManyToOne(() => User, (user) => user.comments)
    author: User;
  
    @ManyToOne(() => Blog, (blog) => blog.comments)
    blog: Blog;
  }
  