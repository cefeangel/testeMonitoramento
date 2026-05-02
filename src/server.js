import app from './app.js';
import sequelize from './config/database.js';
import dotenv from 'dotenv';
// Importação do index de models força a leitura e criação das associações antes de sincronizar
import './models/index.js'; 

dotenv.config();

const PORT = process.env.PORT || 8752;

const startServer = async () => {
  try {
    // Tenta autenticar a conexão com o banco
    await sequelize.authenticate();
    console.log('Conexão com o MySQL (Sequelize) estabelicida com sucesso.');

    // Inicia o Servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT} no modo ${process.env.NODE_ENV}`);
    });

  } catch (error) {
    console.error('❌ Falha ao inicializar a aplicação:', error.message);
    process.exit(1);
  }
};

startServer();
