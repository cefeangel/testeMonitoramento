import * as companionRepository from '../repositories/companionRepository.js';
import * as guestService from './guestService.js';
import * as eventService from './eventService.js';
import * as guestRepository from '../repositories/guestRepository.js';
import { AppError } from '../utils/AppError.js';

export const createCompanion = async (adminId, eventId, guestId, companionData) => {
  const event = await eventService.getEventById(adminId, eventId);
  const guest = await guestService.getGuestById(adminId, eventId, guestId);

  // Limite de acompanhantes por convidado
  if (guest.companions && guest.companions.length >= event.max_dependentes_por_convidado) {
    throw new AppError(`Máximo de ${event.max_dependentes_por_convidado} acompanhantes por convidado atingido`, 400);
  }

  // Capacidade total do evento
  const totalOccupied = await guestRepository.countTotalOccupiedSpotsByEventId(eventId);
  if (totalOccupied + 1 > event.capacidade_total) {
    throw new AppError('Vagas insuficientes para adicionar acompanhante neste evento.', 400);
  }

  return companionRepository.createCompanion({
    ...companionData,
    guest_id: guestId,
  });
};

export const getCompanionsByGuestId = async (adminId, eventId, guestId, limit, offset) => {
  await guestService.getGuestById(adminId, eventId, guestId);
  return companionRepository.findCompanionsByGuestId(guestId, limit, offset);
};

export const deleteCompanion = async (adminId, eventId, guestId, companionId) => {
  await guestService.getGuestById(adminId, eventId, guestId);
  
  const companion = await companionRepository.findCompanionById(companionId);
  if (!companion || companion.guest_id !== Number(guestId)) {
    throw new AppError('Acompanhante não encontrado para este convidado', 404);
  }

  return companionRepository.deleteCompanion(companionId);
};
