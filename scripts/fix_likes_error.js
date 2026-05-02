import sequelize from '../src/config/database.js';

async function fix() {
    const queryInterface = sequelize.getQueryInterface();
    console.log('Iniciando correção do banco de dados...');

    try {
        // Remover updated_at de photo_likes pois não é usada no model
        console.log('Removendo a coluna updated_at da tabela photo_likes...');
        await queryInterface.removeColumn('photo_likes', 'updated_at');
        console.log('Correção concluída com sucesso!');
    } catch (error) {
        console.error('Erro na correção:', error);
    } finally {
        await sequelize.close();
    }
}

fix();
