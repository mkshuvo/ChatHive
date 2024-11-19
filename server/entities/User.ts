import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Message } from "./Message";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id?: string;

  @Column({ unique: true, nullable: false })
  email?: string;

  @Column({ nullable: false })
  username?: string;

  @Column({ nullable: false })
  password?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Message, message => message.sender)
  messages?: Message[];

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}