import sequelize from '../src/config/database.js';
import Photo from '../src/models/Photo.js';

async function migrate() {
  try {
    console.log('Iniciando migração via Sequelize sync({ alter: true })...');
    
    // Sincroniza apenas o model Photo
    await Photo.sync({ alter: true });

    console.log('Migração concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro na migração:', error);
    process.exit(1);
  }
}

migrate();
