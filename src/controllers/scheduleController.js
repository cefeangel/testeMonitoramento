import * as scheduleService from '../services/scheduleService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const createScheduleItem = async (req, res, next) => {
  try {
    const item = await scheduleService.createScheduleItem(req.adminId, req.params.eventId, req.body, req.file);
    res.status(201).json({
      success: true,
      message: 'Item de cronograma criado',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleItems = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const pagination = getPagination(page, limit);
    
    const { count, rows } = await scheduleService.getScheduleItems(req.adminId, req.params.eventId, pagination.limit, pagination.offset);
    
    res.status(200).json({
      success: true,
      message: 'Itens de cronograma recuperados',
      data: formatPaginatedResponse(rows, count, page, pagination.limit)
    });
  } catch (error) {
    next(error);
  }
};

export const getScheduleItem = async (req, res, next) => {
  try {
    const item = await scheduleService.getScheduleItemById(req.adminId, req.params.eventId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Item de cronograma recuperado',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const updateScheduleItem = async (req, res, next) => {
  try {
    const item = await scheduleService.updateScheduleItem(req.adminId, req.params.eventId, req.params.id, req.body, req.file);
    res.status(200).json({
      success: true,
      message: 'Item atualizado',
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScheduleItem = async (req, res, next) => {
  try {
    await scheduleService.deleteScheduleItem(req.adminId, req.params.eventId, req.params.id);
    res.status(200).json({
      success: true,
      message: 'Item excluído',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPhoto = async (req, res, next) => {
  try {
    const item = await scheduleService.uploadSchedulePhoto(
        req.adminId, 
        req.params.eventId, 
        req.params.id, 
        req.file
    );
    res.status(200).json({
      success: true,
      message: 'Foto enviada',
      data: item
    });
  } catch (error) {
    next(error);
  }
};
