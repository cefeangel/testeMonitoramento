import * as scheduleRepository from '../repositories/scheduleRepository.js';
import * as eventService from './eventService.js';
import * as storageService from './storageService.js';
import { AppError } from '../utils/AppError.js';

export const createScheduleItem = async (adminId, eventId, scheduleData, file = null) => {
  await eventService.getEventById(adminId, eventId); // Validação de escopo

  let item = await scheduleRepository.createScheduleItem({
    ...scheduleData,
    event_id: eventId,
  });

  if (file) {
    const foto_url = await storageService.uploadToGCS(
      file.buffer,
      file.originalname,
      eventId,
      item.id,
      file.mimetype
    );
    item = await scheduleRepository.updateScheduleItem(item.id, { foto_url });
  }

  return item;
};

export const getScheduleItems = async (adminId, eventId, limit, offset) => {
  await eventService.getEventById(adminId, eventId); // Validação de escopo
  return scheduleRepository.findScheduleItemsByEventId(eventId, limit, offset);
};

export const getScheduleItemById = async (adminId, eventId, scheduleId) => {
  await eventService.getEventById(adminId, eventId); // Validação de escopo

  const item = await scheduleRepository.findScheduleItemById(scheduleId);
  if (!item || item.event_id !== Number(eventId)) {
    throw new AppError('Item de cronograma não encontrado para este evento', 404);
  }

  return item;
};

export const updateScheduleItem = async (adminId, eventId, scheduleId, updateData, file = null) => {
  const item = await getScheduleItemById(adminId, eventId, scheduleId); // Valida existência e dono

  const finalData = { ...updateData };

  if (file) {
    // Se já existia uma foto, removemos a antiga do GCS para não deixar órfãos
    if (item.foto_url) {
      await storageService.deleteFromGCS(item.foto_url);
    }

    const foto_url = await storageService.uploadToGCS(
      file.buffer,
      file.originalname,
      eventId,
      scheduleId,
      file.mimetype
    );
    finalData.foto_url = foto_url;
  }

  return scheduleRepository.updateScheduleItem(scheduleId, finalData);
};

export const deleteScheduleItem = async (adminId, eventId, scheduleId) => {
  const item = await getScheduleItemById(adminId, eventId, scheduleId); // Valida existência e dono

  // Se existir foto_url, remove do GCS
  if (item.foto_url) {
    await storageService.deleteFromGCS(item.foto_url);
  }

  return scheduleRepository.deleteScheduleItem(scheduleId);
};

export const uploadSchedulePhoto = async (adminId, eventId, scheduleId, file) => {
  const item = await getScheduleItemById(adminId, eventId, scheduleId);

  if (!file) {
    throw new AppError('Nenhum arquivo enviado', 400);
  }

  // Se já existia uma foto, removemos a antiga
  if (item.foto_url) {
    await storageService.deleteFromGCS(item.foto_url);
  }

  const foto_url = await storageService.uploadToGCS(
    file.buffer,
    file.originalname,
    eventId,
    scheduleId,
    file.mimetype
  );

  return scheduleRepository.updateScheduleItem(scheduleId, { foto_url });
};
