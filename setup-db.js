import fs from 'fs';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function createDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    multipleStatements: true
  });

  console.log('✅ Conectado ao MySQL root.');

  // Cria a DB se não existe e usa
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``);
  await connection.query(`USE \`${process.env.DB_NAME}\``);
  
  console.log(`✅ Banco ${process.env.DB_NAME} selecionado.`);

  // Lê o schema
  const schema = fs.readFileSync('database/schema.sql', 'utf8');
  
  // Roda
  console.log('⚙️ Executando schema.sql...');
  await connection.query(schema);
  console.log('✅ Tabelas criadas com sucesso!');

  await connection.end();
}

createDatabase().catch(err => {
  console.error('❌ Erro ao criar BD:', err.message);
  process.exit(1);
});
