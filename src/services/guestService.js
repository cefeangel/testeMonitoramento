import * as guestRepository from '../repositories/guestRepository.js';
import * as eventService from './eventService.js';
import { AppError } from '../utils/AppError.js';

export const createGuest = async (adminId, eventId, guestData) => {
  const event = await eventService.getEventById(adminId, eventId);

  // Validação de Capacidade
  const totalOccupied = await guestRepository.countTotalOccupiedSpotsByEventId(eventId);
  
  if (totalOccupied + 1 > event.capacidade_total) {
    throw new AppError('Vagas insuficientes para este evento.', 400);
  }

  return guestRepository.createGuest({
    ...guestData,
    event_id: eventId,
  });
};

export const getGuests = async (adminId, eventId, limit, offset, search = '') => {
  await eventService.getEventById(adminId, eventId);
  const { count, rows } = await guestRepository.findGuestsByEventId(eventId, limit, offset, search);
  const totalPeople = await guestRepository.countTotalOccupiedSpotsByEventId(eventId);
  
  return { count, rows, totalPeople };
};

export const getGuestById = async (adminId, eventId, guestId) => {
  await eventService.getEventById(adminId, eventId);

  const guest = await guestRepository.findGuestById(guestId);
  if (!guest || guest.event_id !== Number(eventId)) {
    throw new AppError('Convidado não encontrado para este evento', 404);
  }

  return guest;
};

export const updateGuest = async (adminId, eventId, guestId, updateData) => {
  await getGuestById(adminId, eventId, guestId);
  return guestRepository.updateGuest(guestId, updateData);
};

export const deleteGuest = async (adminId, eventId, guestId) => {
  await getGuestById(adminId, eventId, guestId);
  return guestRepository.deleteGuest(guestId);
};

export const getAllGuests = async (adminId, limit, offset) => {
  return guestRepository.findAllGuestsByAdminId(adminId, limit, offset);
};
