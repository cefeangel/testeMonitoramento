import * as companionService from '../services/companionService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const createCompanion = async (req, res, next) => {
  try {
    const companion = await companionService.createCompanion(
      req.adminId, 
      req.params.eventId, 
      req.params.guestId, 
      req.body
    );
    res.status(201).json({
      success: true,
      message: 'Acompanhante adicionado',
      data: companion
    });
  } catch (error) {
    next(error);
  }
};

export const getCompanions = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { count, rows } = await companionService.getCompanionsByGuestId(
      req.adminId, 
      req.params.eventId, 
      req.params.guestId,
      pagination.limit,
      pagination.offset
    );

    res.status(200).json({
      success: true,
      message: 'Acompanhantes recuperados',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCompanion = async (req, res, next) => {
  try {
    await companionService.deleteCompanion(
      req.adminId, 
      req.params.eventId, 
      req.params.guestId, 
      req.params.id
    );
    res.status(200).json({
      success: true,
      message: 'Acompanhante removido',
      data: null
    });
  } catch (error) {
    next(error);
  }
};
