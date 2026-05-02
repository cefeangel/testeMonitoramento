import { Guest, Companion } from '../models/index.js';
import { Op } from 'sequelize';

export const createGuest = async (guestData) => {
  return Guest.create(guestData);
};

export const findGuestsByEventId = async (event_id, limit, offset, search = '') => {
  const where = { event_id };

  if (search) {
    where[Op.or] = [
      { nome_completo: { [Op.like]: `%${search}%` } },
      { telefone: { [Op.like]: `%${search}%` } },
      { '$companions.nome_completo$': { [Op.like]: `%${search}%` } }
    ];
  }

  return Guest.findAndCountAll({ 
    where,
    limit,
    offset,
    distinct: true, 
    subQuery: false, // Necessário para busca em associações com limite/paginação
    include: [{ model: Companion, as: 'companions' }],
    order: [['created_at', 'DESC']] // Mais recentes primeiro
  });
};

export const findGuestById = async (id) => {
  return Guest.findByPk(id, {
    include: [{ model: Companion, as: 'companions' }]
  });
};

export const updateGuest = async (id, updateData) => {
  await Guest.update(updateData, { where: { id } });
  return findGuestById(id);
};

export const deleteGuest = async (id) => {
  return Guest.destroy({ where: { id } });
};

export const countTotalOccupiedSpotsByEventId = async (event_id) => {
  // Para contagem total, não usamos paginação
  const guests = await Guest.findAll({ 
    where: { event_id },
    include: [{ model: Companion, as: 'companions' }]
  });
  
  let total = guests.length;
  guests.forEach(guest => {
    total += guest.companions ? guest.companions.length : 0;
  });
  return total;
};

export const findAllGuestsByAdminId = async (adminId, limit, offset) => {
  const { Event, Companion } = await import('../models/index.js');
  return Guest.findAndCountAll({
    include: [
      {
        model: Event,
        as: 'event',
        where: { admin_id: adminId },
        attributes: ['id', 'nome']
      },
      { model: Companion, as: 'companions' }
    ],
    limit,
    offset,
    distinct: true,
    order: [['created_at', 'DESC']]
  });
};
