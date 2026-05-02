import sequelize from '../src/config/database.js';
import Photo from '../src/models/Photo.js';
import { DataTypes } from 'sequelize';

async function migrate() {
    const queryInterface = sequelize.getQueryInterface();
    
    console.log('Iniciando migração para Sistema de Curtidas...');

    try {
        // 1. Adicionar likes_count à tabela photos se não existir
        const tableInfo = await queryInterface.describeTable('photos');
        if (!tableInfo.likes_count) {
            console.log('Adicionando coluna likes_count à tabela photos...');
            await queryInterface.addColumn('photos', 'likes_count', {
                type: DataTypes.INTEGER.UNSIGNED,
                defaultValue: 0,
                allowNull: false
            });
        } else {
            console.log('Coluna likes_count já existe na tabela photos.');
        }

        // 2. Criar a tabela photo_likes
        console.log('Criando tabela photo_likes...');
        await queryInterface.createTable('photo_likes', {
            id: {
                type: DataTypes.INTEGER.UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
            },
            photo_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: {
                    model: 'photos',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            visitor_id: {
                type: DataTypes.STRING(255),
                allowNull: false,
                comment: 'ID de sessão ou fingerprint do dispositivo'
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
                allowNull: false
            }
        });

        // Adicionar índice para performance e unicidade
        await queryInterface.addIndex('photo_likes', ['photo_id', 'visitor_id'], {
            unique: true,
            name: 'unique_photo_visitor'
        });

        console.log('Migração concluída com SUCESSO!');
    } catch (error) {
        console.error('ERRO na migração:', error);
    } finally {
        await sequelize.close();
    }
}

migrate();
