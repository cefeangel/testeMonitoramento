import * as confirmationRepository from '../repositories/confirmationRepository.js';
import * as guestService from './guestService.js';
import * as eventService from './eventService.js';

export const confirmPresence = async (adminId, eventId, guestId, status) => {
  await guestService.getGuestById(adminId, eventId, guestId);
  return confirmationRepository.upsertConfirmation(guestId, status);
};

export const cancelConfirmation = async (adminId, eventId, guestId) => {
  await guestService.getGuestById(adminId, eventId, guestId);
  return confirmationRepository.removeConfirmation(guestId);
};

export const getEventConfirmations = async (adminId, eventId, limit, offset) => {
  await eventService.getEventById(adminId, eventId);
  return confirmationRepository.findConfirmationsByEventId(eventId, limit, offset);
};

export const getAllEventConfirmations = async (adminId, eventId) => {
  await eventService.getEventById(adminId, eventId);
  return confirmationRepository.findAllConfirmationsByEventId(eventId);
};
