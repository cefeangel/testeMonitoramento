import { sequelize } from '../src/models/index.js';

async function fixPhotosTable() {
    console.log('Iniciando correção da tabela photos...');
    
    try {
        // 1. Obter a estrutura atual para referência
        const [results] = await sequelize.query("PRAGMA table_info(photos)");
        console.log('Estrutura atual detectada.');

        // 2. Desativar chaves estrangeiras temporariamente
        await sequelize.query("PRAGMA foreign_keys=OFF");

        await sequelize.transaction(async (t) => {
            // 3. Criar tabela temporária com a estrutura correta (schedule_item_id NULL)
            // Nota: uploaded_at já deve existir da correção anterior, mas garantimos aqui
            await sequelize.query(`
                CREATE TABLE photos_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id INTEGER NOT NULL,
                    schedule_item_id INTEGER,
                    enviado_por VARCHAR(150) NOT NULL,
                    foto_url VARCHAR(500) NOT NULL,
                    thumbnail_url VARCHAR(500),
                    uploaded_at DATETIME,
                    created_at DATETIME,
                    updated_at DATETIME
                )
            `, { transaction: t });

            console.log('Tabela temporária criada.');

            // 4. Copiar dados
            // Mapeamos os nomes das colunas conforme o que existe no banco
            const columns = results.map(r => r.name).join(', ');
            await sequelize.query(`INSERT INTO photos_new (${columns}) SELECT ${columns} FROM photos`, { transaction: t });
            console.log('Dados copiados para a nova tabela.');

            // 5. Remover tabela antiga e renomear a nova
            await sequelize.query("DROP TABLE photos", { transaction: t });
            await sequelize.query("ALTER TABLE photos_new RENAME TO photos", { transaction: t });
            console.log('Tabela renomeada com sucesso.');
        });

        // 6. Reativar chaves estrangeiras
        await sequelize.query("PRAGMA foreign_keys=ON");
        
        console.log('Correção finalizada com sucesso!');
    } catch (error) {
        console.error('Erro na correção:', error);
    } finally {
        process.exit();
    }
}

fixPhotosTable();
