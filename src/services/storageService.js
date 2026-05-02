import { bucket } from '../config/storage.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

/**
 * Upload a file to Google Cloud Storage
 * @param {Buffer} fileBuffer - The file content as a Buffer
 * @param {string} fileName - Original file name
 * @param {number} eventId - ID of the event
 * @param {number} scheduleId - ID of the schedule item
 * @returns {Promise<string>} - The public URL of the uploaded file
 */
export const uploadToGCS = async (fileBuffer, fileName, eventId, scheduleId, mimetype = 'image/jpeg') => {
  const extension = path.extname(fileName) || '.jpg';
  const newFileName = `${Date.now()}-${uuidv4()}${extension}`;
  
  // Caminho estruturado: events/{idEvento}/(schedules/{idSchedule}/)?photos/{filename}
  const destination = scheduleId 
    ? `events/${eventId}/schedules/${scheduleId}/photos/${newFileName}`
    : `events/${eventId}/photos/${newFileName}`;
  
  const file = bucket.file(destination);
  console.log(`[GCS] Gravando arquivo ${newFileName} no bucket ${bucket.name}... (Tamanho: ${fileBuffer.length} bytes)`);
  
  try {
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimetype,
      },
      resumable: true,
    });
  } catch (gcsError) {
    console.error(`[GCS ERROR] Falha ao salvar no bucket:`, gcsError);
    throw gcsError;
  }

  console.log(`[GCS] Arquivo ${newFileName} gravado com sucesso.`);

  // Torna o arquivo público (opcional, dependendo das permissões do bucket)
  // await file.makePublic();

  // URL pública do GCS (pode ser configurada para ser assinada ou aberta)
  return `https://storage.googleapis.com/${bucket.name}/${destination}`;
};

/**
 * Delete a file from Google Cloud Storage
 * @param {string} fotoUrl - The full public URL of the photo
 * @returns {Promise<void>}
 */
export const deleteFromGCS = async (fotoUrl) => {
  console.log(`Solicitação de exclusão do GCS para: ${fotoUrl}`);
  
  if (!fotoUrl || !fotoUrl.includes(bucket.name)) {
    console.warn(`URL inválida ou bucket incompatível: ${fotoUrl} (Esperado: ${bucket.name})`);
    return;
  }

  try {
    // Extrai o caminho após o nome do bucket
    // Exemplo URL: https://storage.googleapis.com/meu-bucket/events/1/schedules/2/photos/file.jpg
    const urlParts = fotoUrl.split(`${bucket.name}/`);
    if (urlParts.length < 2) {
      console.warn(`Não foi possível extrair o caminho do destino de: ${fotoUrl}`);
      return;
    }

    const destination = urlParts[1];
    console.log(`Caminho extraído para exclusão: ${destination}`);
    
    const file = bucket.file(destination);

    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
      console.log(`SUCESSO: Foto removida do GCS: ${destination}`);
    } else {
      console.warn(`ARQUIVO NÃO ENCONTRADO no GCS: ${destination}`);
    }
  } catch (error) {
    console.error('ERRO CRÍTICO ao deletar arquivo do GCS:', error);
    // Não lançamos erro no delete para não quebrar a remoção do banco, 
    // mas logamos o ocorrido detalhadamente.
  }
};
