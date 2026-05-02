import * as confirmationService from '../services/confirmationService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const confirmPresence = async (req, res, next) => {
  try {
    const confirmation = await confirmationService.confirmPresence(
      req.adminId,
      req.params.eventId,
      req.params.guestId,
      req.body.status
    );
    res.status(200).json({
      success: true,
      message: 'Presença confirmada',
      data: confirmation
    });
  } catch (error) {
    next(error);
  }
};

export const cancelConfirmation = async (req, res, next) => {
  try {
    await confirmationService.cancelConfirmation(
      req.adminId,
      req.params.eventId,
      req.params.guestId
    );
    res.status(200).json({
      success: true,
      message: 'Confirmação cancelada',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const getEventConfirmations = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);

    const { count, rows } = await confirmationService.getEventConfirmations(req.adminId, req.params.eventId, pagination.limit, pagination.offset);
    
    res.status(200).json({
      success: true,
      message: 'Confirmações recuperadas',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getAllConfirmations = async (req, res, next) => {
  try {
    const confirmations = await confirmationService.getAllEventConfirmations(req.adminId, req.params.eventId);
    
    res.status(200).json({
      success: true,
      message: 'Todas as confirmações recuperadas',
      data: {
        items: confirmations // Keep the 'items' key to respect the frontend expectation
      }
    });
  } catch (error) {
    next(error);
  }
};
