import { bucket } from './src/config/storage.js';
import fs from 'fs';

const testUpload = async () => {
  try {
    console.log('🚀 Iniciando teste de conexão com o Google Cloud Storage...');
    console.log(`📂 Bucket: ${bucket.name}`);

    // Cria um arquivo temporário de teste
    const fileName = `test-connection-${Date.now()}.txt`;
    const file = bucket.file(`tests/${fileName}`);

    console.log(`📤 Fazendo upload do arquivo ${fileName}...`);
    await file.save('Este é um arquivo de teste para verificar a conexão do GCS.', {
      resumable: false,
      metadata: { contentType: 'text/plain' }
    });

    console.log('✅ Upload concluído com sucesso!');
    
    // Deleta o arquivo após o teste
    console.log('🗑️ Excluindo arquivo de teste...');
    await file.delete();
    console.log('✅ Arquivo de teste removido.');
    
    console.log('🎉 Conexão com GCS verificada e funcionando!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Falha na conexão com o GCS:', error.message);
    if (error.code) console.error(`Código de erro: ${error.code}`);
    process.exit(1);
  }
};

testUpload();
