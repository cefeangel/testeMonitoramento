import { uploadToGCS } from './src/services/storageService.js';
import fs from 'fs';

// Mock IDs para o teste
const mockEventId = 1;
const mockScheduleId = 1;

const testUploadEstruturado = async () => {
  try {
    console.log(`🚀 Iniciando teste de upload estruturado para o evento ${mockEventId} e cronograma ${mockScheduleId}...`);

    // Criando um buffer hexadecimal que representa uma imagem de 1x1 pixel (PNG transparente)
    const mockImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    const mockFileName = 'mock-test-photo.png';

    console.log('📤 Enviando foto simulada para o Google Cloud Storage...');
    const resultUrl = await uploadToGCS(mockImageBuffer, mockFileName, mockEventId, mockScheduleId);

    console.log('✅ Upload concluído!');
    console.log(`🔗 URL Gerada: ${resultUrl}`);

    // Verifica se a URL contém a estrutura correta
    const expectedPath = `events/${mockEventId}/schedules/${mockScheduleId}/photos/`;
    if (resultUrl.includes(expectedPath)) {
      console.log('✨ A estrutura do caminho (path) está CORRETA!');
    } else {
      console.warn('⚠️ A estrutura do caminho não parece corresponder ao esperado.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Falha no teste de upload estruturado:', error.message);
    process.exit(1);
  }
};

testUploadEstruturado();
