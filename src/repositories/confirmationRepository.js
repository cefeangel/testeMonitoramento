import { Confirmation, Guest, Companion } from '../models/index.js';

export const upsertConfirmation = async (guest_id, status) => {
  const [confirmation, created] = await Confirmation.findOrCreate({
    where: { guest_id },
    defaults: { status }
  });

  if (!created && confirmation.status !== status) {
    confirmation.status = status;
    await confirmation.save();
  }

  return confirmation;
};

export const removeConfirmation = async (guest_id) => {
  return Confirmation.destroy({ where: { guest_id } });
};

export const findConfirmationsByEventId = async (event_id, limit, offset) => {
  return Confirmation.findAndCountAll({
    limit,
    offset,
    distinct: true, 
    include: [{
      model: Guest,
      as: 'guest',
      where: { event_id },
      include: [{
        model: Companion,
        as: 'companions'
      }]
    }]
  });
};

export const findAllConfirmationsByEventId = async (event_id) => {
  return Confirmation.findAll({
    include: [{
      model: Guest,
      as: 'guest',
      where: { event_id }
    }]
  });
};
