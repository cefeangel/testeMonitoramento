import { Event, Guest, Companion, Confirmation } from '../models/index.js';

export const createEvent = async (eventData) => {
  return Event.create(eventData);
};

export const findEventsByAdminId = async (admin_id, limit, offset) => {
  return Event.findAndCountAll({ 
    where: { admin_id }, 
    limit, 
    offset, 
    order: [['data_hora', 'DESC']] 
  });
};

export const findEventById = async (id) => {
  return Event.findByPk(id);
};

export const updateEvent = async (id, updateData) => {
  await Event.update(updateData, { where: { id } });
  return findEventById(id);
};

export const deleteEvent = async (id) => {
  return Event.destroy({ where: { id } });
};

export const findEventReportsByAdminId = async (admin_id) => {
  return Event.findAll({
    where: { admin_id },
    include: [
      {
        model: Guest,
        as: 'guests',
        include: [
          { model: Companion, as: 'companions' },
          { model: Confirmation, as: 'confirmation' }
        ]
      }
    ],
    order: [['data_hora', 'DESC']]
  });
};
