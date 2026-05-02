import { Photo, ScheduleItem, PhotoLike } from '../models/index.js';
import { Op } from 'sequelize';

export const findTopPhotosByEventId = async (event_id, limit = 10) => {
  return Photo.findAll({
    where: { 
      event_id,
      likes_count: { [Op.gt]: 0 } // Only photos with at least one like
    },
    limit,
    order: [['likes_count', 'DESC'], ['uploaded_at', 'DESC']]
  });
};

export const createLike = async (photo_id, visitor_id) => {
  return PhotoLike.create({ photo_id, visitor_id });
};

export const deleteLike = async (photo_id, visitor_id) => {
  return PhotoLike.destroy({
    where: { photo_id, visitor_id }
  });
};

export const findLike = async (photo_id, visitor_id) => {
  return PhotoLike.findOne({
    where: { photo_id, visitor_id }
  });
};


export const createPhoto = async (photoData) => {
  return Photo.create(photoData);
};

export const findPhotosByEventId = async (event_id, limit, offset) => {
  return Photo.findAndCountAll({
    where: { event_id },
    limit,
    offset,
    order: [['uploaded_at', 'DESC']]
  });
};

export const findPhotosByScheduleItemId = async (schedule_item_id, limit, offset) => {
  return Photo.findAndCountAll({ 
    where: { schedule_item_id }, 
    limit, 
    offset, 
    order: [['uploaded_at', 'DESC']] 
  });
};

export const findPhotoById = async (id) => {
  return Photo.findByPk(id);
};

export const deletePhoto = async (id) => {
  return Photo.destroy({ where: { id } });
};
