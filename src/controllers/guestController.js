import * as guestService from '../services/guestService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const createGuest = async (req, res, next) => {
  try {
    const guest = await guestService.createGuest(req.adminId, req.params.eventId, req.body);
    res.status(201).json({
      success: true,
      message: 'Convidado criado',
      data: guest
    });
  } catch (error) {
    next(error);
  }
};

export const getGuests = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;
    const pagination = getPagination(page, limit);
    
    const { count, rows, totalPeople } = await guestService.getGuests(req.adminId, req.params.eventId, pagination.limit, pagination.offset, search);
    
    const paginatedData = formatPaginatedResponse(rows, count, page, pagination.limit);
    
    res.status(200).json({
      success: true,
      message: 'Convidados recuperados',
      data: {
        ...paginatedData,
        totalPeople // Adicionando o contador global
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getGuest = async (req, res, next) => {
  try {
    const guest = await guestService.getGuestById(req.adminId, req.params.eventId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Convidado recuperado',
      data: guest
    });
  } catch (error) {
    next(error);
  }
};

export const updateGuest = async (req, res, next) => {
  try {
    const guest = await guestService.updateGuest(req.adminId, req.params.eventId, req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Convidado atualizado',
      data: guest
    });
  } catch (error) {
    next(error);
  }
};

export const deleteGuest = async (req, res, next) => {
  try {
    await guestService.deleteGuest(req.adminId, req.params.eventId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Convidado removido',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getAllGuests = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);
    
    const { count, rows } = await guestService.getAllGuests(req.adminId, pagination.limit, pagination.offset);
    
    res.status(200).json({
      success: true,
      message: 'Todos os convidados recuperados',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};
