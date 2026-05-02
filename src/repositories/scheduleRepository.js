import { ScheduleItem } from '../models/index.js';

export const createScheduleItem = async (scheduleData) => {
  return ScheduleItem.create(scheduleData);
};

export const findScheduleItemsByEventId = async (event_id, limit, offset) => {
  return ScheduleItem.findAndCountAll({ 
    where: { event_id }, 
    limit, 
    offset, 
    order: [['id', 'ASC']] 
  });
};

export const findScheduleItemById = async (id) => {
  return ScheduleItem.findByPk(id);
};

export const updateScheduleItem = async (id, updateData) => {
  await ScheduleItem.update(updateData, { where: { id } });
  return findScheduleItemById(id);
};

export const deleteScheduleItem = async (id) => {
  return ScheduleItem.destroy({ where: { id } });
};
