import * as eventRepository from '../repositories/eventRepository.js';
import { AppError } from '../utils/AppError.js';

export const createEvent = async (adminId, eventData) => {
  return eventRepository.createEvent({
    ...eventData,
    admin_id: adminId,
  });
};

export const getEventsByAdminId = async (adminId, limit, offset) => {
  return eventRepository.findEventsByAdminId(adminId, limit, offset);
};

export const getEventById = async (adminId, eventId) => {
  const event = await eventRepository.findEventById(eventId);

  if (!event) {
    throw new AppError('Evento não encontrado', 404);
  }

  if (event.admin_id !== adminId) {
    throw new AppError('Acesso não autorizado', 403);
  }

  return event;
};

export const updateEvent = async (adminId, eventId, updateData) => {
  await getEventById(adminId, eventId); // Verifica existência e permissão
  return eventRepository.updateEvent(eventId, updateData);
};

export const deleteEvent = async (adminId, eventId) => {
  await getEventById(adminId, eventId); // Verifica existência e permissão
  return eventRepository.deleteEvent(eventId);
};

export const getEventReport = async (adminId) => {
  const eventsData = await eventRepository.findEventReportsByAdminId(adminId);

  const reportData = eventsData.map(event => {
    let totalConfirmados = 0;
    let totalPessoasConfirmadas = 0;

    const guests = event.guests || [];

    guests.forEach(guest => {
      const isConfirmado = !!guest.confirmation;
      const companionsCount = guest.companions?.length || 0;

      if (isConfirmado) {
        totalConfirmados++;
        totalPessoasConfirmadas += (1 + companionsCount);
      }
    });

    return {
      id: event.id,
      nome: event.nome,
      data: event.data_hora,
      capacidade: event.capacidade_total,
      stats: {
        convidadosTotais: guests.length,
        confirmados: totalConfirmados,
        pendentes: guests.length - totalConfirmados,
        ocupacaoAtual: totalPessoasConfirmadas,
        percentualOcupacao: Math.round((totalPessoasConfirmadas / event.capacidade_total) * 100)
      }
    };
  });

  return {
    global: {
      totalEventos: reportData.length,
      totalConvidadosBase: reportData.reduce((acc, c) => acc + c.stats.convidadosTotais, 0),
      totalConfirmacoes: reportData.reduce((acc, c) => acc + c.stats.confirmados, 0),
      totalPresencasEstimadas: reportData.reduce((acc, c) => acc + c.stats.ocupacaoAtual, 0)
    },
    events: reportData
  };
};
