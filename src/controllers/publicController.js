import Event from '../models/Event.js';
import ScheduleItem from '../models/ScheduleItem.js';
import Photo from '../models/Photo.js';
import * as storageService from '../services/storageService.js';
import * as galleryService from '../services/galleryService.js';
import { AppError } from '../utils/AppError.js';

export const getEventAndSchedule = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId, {
      include: [{
        model: ScheduleItem,
        as: 'schedules',
        order: [['data_hora', 'ASC']]
      }]
    });

    if (!event) {
      throw new AppError('Evento não encontrado', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Dados do evento e cronograma',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const getGallery = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    // Buscar fotos diretamente pelo event_id
    const photos = await Photo.findAll({
      where: { event_id: eventId },
      order: [['uploaded_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: 'Fotos do evento',
      data: photos
    });
  } catch (error) {
    next(error);
  }
};

export const uploadGuestPhoto = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const enviado_por = req.body.enviado_por || 'Convidado';
    const scheduleId = req.body.scheduleId || null; 

    console.log(`[UPLOAD] Início do upload pelo convidado no evento ${eventId}`);
    const file = req.file || (req.files && req.files[0]);

    if (!file) {
      console.warn(`[UPLOAD] Nenhum arquivo recebido para o evento ${eventId}`);
      throw new AppError('Nenhuma imagem enviada no formulário', 400);
    }

    console.log(`[UPLOAD] Arquivo recebido: ${file.originalname} (${file.size} bytes), tipo: ${file.mimetype}`);

    // 1. Upload para o GCS
    console.log(`[UPLOAD] Iniciando transferência para o GCS...`);
    const fotoUrl = await storageService.uploadToGCS(
      file.buffer,
      file.originalname,
      eventId,
      scheduleId,
      file.mimetype
    );
    console.log(`[UPLOAD] Transferência GCS concluída: ${fotoUrl}`);

    // 2. Salvar na base de dados
    const media_type = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    
    const photo = await galleryService.addPhoto({
      event_id: eventId,
      schedule_item_id: scheduleId,
      enviado_por,
      foto_url: fotoUrl,
      media_type,
      mimetype: file.mimetype
    });

    res.status(201).json({
      success: true,
      message: 'Foto enviada com sucesso por um convidado',
      data: photo
    });
  } catch (error) {
    next(error);
  }
};
