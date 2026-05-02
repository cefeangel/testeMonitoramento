import * as galleryService from '../services/galleryService.js';
import * as storageService from '../services/storageService.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const getGallery = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { count, rows } = await galleryService.getGalleryByEventId(req.adminId, req.params.eventId, pagination.limit, pagination.offset);
    
    res.status(200).json({
      success: true,
      message: 'Galeria do evento',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getGalleryByScheduleItem = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { count, rows } = await galleryService.getGalleryByScheduleItemId(req.adminId, req.params.eventId, req.params.scheduleId, pagination.limit, pagination.offset);
    
    res.status(200).json({
      success: true,
      message: 'Fotos do item',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    await galleryService.removePhoto(req.adminId, req.params.eventId, req.params.photoId);
    res.status(200).json({
      success: true,
      message: 'Foto excluída',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPhoto = async (req, res, next) => {
  try {
    const { eventId, scheduleId } = req.params;
    
    // Tentar pegar enviado_por de vários lugares (Body primeiro, depois Query)
    const enviado_por = req.body.enviado_por || req.query.enviado_por;

    // Tentar pegar a foto se o multer estiver como .any()
    // Aceitar tanto 'foto' quanto 'photo'
    const file = req.file || (req.files && req.files.find(f => f.fieldname === 'foto' || f.fieldname === 'photo'));

    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('Arquivo:', file ? file.originalname : 'Nenhum');

    if (!file) {
      throw new AppError('Nenhuma foto ("foto") enviada no formulário', 400);
    }

    if (!enviado_por || enviado_por.trim() === '') {
      throw new AppError('Campo "enviado_por" é obrigatório no Body ou na URL (?enviado_por=...)', 400);
    }

    // 1. Upload para o GCS
    const fotoUrl = await storageService.uploadToGCS(
      file.buffer,
      file.originalname,
      eventId,
      scheduleId,
      file.mimetype
    );

    // 2. Salvar na base de dados
    const mediaType = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    const photo = await galleryService.addPhoto({
      event_id: eventId,
      schedule_item_id: scheduleId || null,
      enviado_por,
      foto_url: fotoUrl,
      media_type: mediaType,
      mimetype: file.mimetype
    });

    res.status(201).json({
      success: true,
      message: 'Foto enviada com sucesso',
      data: photo
    });
  } catch (error) {
    next(error);
  }
};

export const toggleLike = async (req, res, next) => {
  try {
    const { eventId, photoId } = req.params;
    const { visitor_id } = req.body;

    if (!visitor_id) {
       throw new AppError('visitor_id é obrigatório para curtir uma foto', 400);
    }

    const result = await galleryService.togglePhotoLike(eventId, photoId, visitor_id);

    res.status(200).json({
      success: true,
      message: result.liked ? 'Foto curtida' : 'Curtida removida',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getTopPhotos = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const photos = await galleryService.getTopPhotos(req.adminId, eventId);

    res.status(200).json({
      success: true,
      message: 'Fotos mais curtidas recuperadas',
      data: photos
    });
  } catch (error) {
    next(error);
  }
};

export const downloadProxy = async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) throw new AppError('URL da foto é obrigatória', 400);

    // Buscar o arquivo via fetch (nativo no Node 18+)
    const response = await fetch(url);
    if (!response.ok) throw new AppError('Erro ao buscar arquivo no storage', 404);

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Extrair nome do arquivo da URL ou gerar um
    const filename = url.split('/').pop() || 'foto.jpg';

    // Configurar cabeçalhos para forçar download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

