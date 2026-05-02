import { sequelize } from '../src/models/index.js';

async function addEventCoverColumn() {
    console.log('Iniciando adição da coluna foto_capa no MySQL...');
    
    try {
        await sequelize.query("ALTER TABLE events ADD COLUMN foto_capa VARCHAR(500) AFTER capacidade_total");
        console.log('Coluna foto_capa adicionada com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar coluna (pode já existir):', error.message);
    } finally {
        process.exit();
    }
}

addEventCoverColumn();
