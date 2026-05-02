import { sequelize } from '../src/models/index.js';

async function fixPhotosMySQL() {
    console.log('Iniciando correção da tabela photos no MySQL...');
    
    try {
        // 1. Tornar schedule_item_id opcional
        await sequelize.query("ALTER TABLE photos MODIFY schedule_item_id INT UNSIGNED NULL");
        console.log('Coluna schedule_item_id alterada para NULL com sucesso.');

        // 2. Garantir que uploaded_at exista se necessário (embora o sync devesse tratar)
        // No MySQL usamos MODIFY ou ADD conforme necessário. 
        // Se já existe, apenas confirmamos o tipo.
        try {
            await sequelize.query("ALTER TABLE photos MODIFY uploaded_at DATETIME NULL");
            console.log('Coluna uploaded_at verificada/atualizada.');
        } catch (e) {
            console.log('Nota: uploaded_at pode não existir ou já estar correta.');
        }

        console.log('Correção finalizada com sucesso!');
    } catch (error) {
        console.error('Erro na correção MySQL:', error);
    } finally {
        process.exit();
    }
}

fixPhotosMySQL();
