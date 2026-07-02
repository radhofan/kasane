import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('jobs')
export class Job {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    default: 'pending',
  })
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ name: 'original_name', type: 'varchar' })
  originalName!: string;

  @Column({ name: 'original_path', type: 'varchar' })
  originalPath!: string;

  @Column({ name: 'processed_path', type: 'varchar', nullable: true })
  processedPath!: string | null;

  @Column({ type: 'text', nullable: true })
  error!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
