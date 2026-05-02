import { Companion } from '../models/index.js';

export const createCompanion = async (companionData) => {
  return Companion.create(companionData);
};

export const findCompanionsByGuestId = async (guest_id, limit, offset) => {
  return Companion.findAndCountAll({ 
    where: { guest_id }, 
    limit, 
    offset, 
    order: [['created_at', 'ASC']] 
  });
};

export const findCompanionById = async (id) => {
  return Companion.findByPk(id);
};

export const deleteCompanion = async (id) => {
  return Companion.destroy({ where: { id } });
};
