import * as eventService from '../services/eventService.js';
import * as storageService from '../services/storageService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';
import { AppError } from '../utils/AppError.js';

export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.adminId, req.body);
    res.status(201).json({
      success: true,
      message: 'Evento criado com sucesso',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { count, rows } = await eventService.getEventsByAdminId(req.adminId, pagination.limit, pagination.offset);

    res.status(200).json({
      success: true,
      message: 'Eventos recuperados',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getEvent = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.adminId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Evento recuperado',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.adminId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Evento atualizado',
      data: event
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.adminId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Evento excluído com sucesso',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req, res, next) => {
  try {
    const report = await eventService.getEventReport(req.adminId);
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCover = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const file = req.file;

    if (!file) {
      throw new AppError('Nenhuma foto enviada', 400);
    }

    // 1. Upload para o GCS (sem scheduleId pois é capa do evento)
    const fotoUrl = await storageService.uploadToGCS(
      file.buffer,
      file.originalname,
      eventId,
      null,
      file.mimetype
    );

    // 2. Atualizar o evento
    const event = await eventService.updateEvent(req.adminId, eventId, { foto_capa: fotoUrl });

    res.status(200).json({
      success: true,
      message: 'Capa do evento atualizada com sucesso',
      data: event
    });
  } catch (error) {
    next(error);
  }
};
