import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notion-config')
export class NotionConfigEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    internalIntegrationToken: string;

    @Column()
    rootBlockId: string;

    @Column({ nullable: true })
    mediaLibraryDatabaseId: string;

}