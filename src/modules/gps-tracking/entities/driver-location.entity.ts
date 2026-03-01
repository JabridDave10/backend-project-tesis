import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('driver_locations')
@Index(['id_driver', 'recorded_at'])
export class DriverLocation {
  @PrimaryGeneratedColumn()
  id_location: number;

  @Column('int')
  id_driver: number;

  @Column('int', { nullable: true })
  id_vehicle: number;

  @Column('int', { nullable: true })
  id_route: number;

  @Column('decimal', { precision: 10, scale: 7 })
  latitude: number;

  @Column('decimal', { precision: 10, scale: 7 })
  longitude: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  speed: number;

  @Column('decimal', { precision: 5, scale: 2, nullable: true })
  heading: number;

  @Column('decimal', { precision: 6, scale: 2, nullable: true })
  accuracy: number;

  @Column('text', { default: 'en_ruta' })
  status: string;

  @CreateDateColumn()
  recorded_at: Date;
}
