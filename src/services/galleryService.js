import * as galleryRepository from '../repositories/galleryRepository.js';
import * as eventService from './eventService.js';
import * as storageService from './storageService.js';
import { AppError } from '../utils/AppError.js';

export const getGalleryByEventId = async (adminId, eventId, limit, offset) => {
  await eventService.getEventById(adminId, eventId);
  return galleryRepository.findPhotosByEventId(eventId, limit, offset);
};

export const getGalleryByScheduleItemId = async (adminId, eventId, scheduleId, limit, offset) => {
  await eventService.getEventById(adminId, eventId);
  return galleryRepository.findPhotosByScheduleItemId(scheduleId, limit, offset);
};

export const removePhoto = async (adminId, eventId, photoId) => {
  await eventService.getEventById(adminId, eventId);
  
  const photo = await galleryRepository.findPhotoById(photoId);
  if (!photo) {
    throw new AppError('Foto não encontrada', 404);
  }

  // Sincronização com o GCS: Remove o arquivo físico antes de apagar o registro
  if (photo.foto_url) {
    await storageService.deleteFromGCS(photo.foto_url);
  }

  return galleryRepository.deletePhoto(photoId);
};

export const addPhoto = async ({ event_id, schedule_item_id, enviado_por, foto_url, media_type, mimetype }) => {
  return galleryRepository.createPhoto({
    event_id,
    schedule_item_id,
    enviado_por,
    foto_url,
    media_type,
    mimetype
  });
};

export const getTopPhotos = async (adminId, eventId) => {
  await eventService.getEventById(adminId, eventId);
  return galleryRepository.findTopPhotosByEventId(eventId);
};

export const togglePhotoLike = async (eventId, photoId, visitor_id) => {
  const photo = await galleryRepository.findPhotoById(photoId);
  if (!photo) {
    throw new AppError('Foto não encontrada', 404);
  }

  const existingLike = await galleryRepository.findLike(photoId, visitor_id);
  
  if (existingLike) {
    // Caso de remover Like
    await galleryRepository.deleteLike(photoId, visitor_id);
    await photo.decrement('likes_count', { by: 1 });
    return { liked: false, likes_count: photo.likes_count - 1 };
  } else {
    // Caso de adicionar Like
    await galleryRepository.createLike(photoId, visitor_id);
    await photo.increment('likes_count', { by: 1 });
    return { liked: true, likes_count: photo.likes_count + 1 };
  }
};

