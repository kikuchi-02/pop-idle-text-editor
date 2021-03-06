import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DeltaOperation } from '../typing';
import { Message } from './Message';
import { User } from './User';

@Entity()
export class Script {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @CreateDateColumn()
  created: Date;

  @UpdateDateColumn()
  updated: Date;

  @Column({ type: 'json', default: [] })
  deltaOps: DeltaOperation[];

  @ManyToOne((type) => User, (user) => user.scripts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  author: User;

  @OneToMany((type) => Message, (message) => message.script)
  messages: Message[];

  // @Column({ type: 'enum', enum: ScriptStatus, default: ScriptStatus.WIP })
  // status: ScriptStatus;

  @OneToMany((type) => ScriptRevision, (revision) => revision.script)
  revisions: ScriptRevision[];
}

// https://kaustavdm.in/versioning-content-postgresql/

@Entity()
export class ScriptRevision {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne((type) => Script, (script) => script.revisions, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  script: Script;

  @Column()
  title: string;

  @Column({ type: 'timestamp', nullable: true })
  created: Date;

  @Column({ type: 'json', default: [] })
  deltaOps: DeltaOperation[];
}
