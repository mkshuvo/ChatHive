import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id?: string | number;

  @Column()
  content?: string;

  @Column({ nullable: true })
  mediaUrl?: string;

  @ManyToOne(() => User, user => user.messages)
  sender?: User;

  @Column("uuid")
  receiverId?: string;

  @CreateDateColumn()
  createdAt?: Date;
}