import sequelize from '../config/database.js';

import Admin from './Admin.js';
import Event from './Event.js';
import ScheduleItem from './ScheduleItem.js';
import Guest from './Guest.js';
import Companion from './Companion.js';
import Confirmation from './Confirmation.js';
import QRCode from './QRCode.js';
import Photo from './Photo.js';
import PhotoLike from './PhotoLike.js';


// Relacionamentos

// Admin <-> Event (1:N)
Admin.hasMany(Event, { foreignKey: 'admin_id', as: 'events', onDelete: 'CASCADE' });
Event.belongsTo(Admin, { foreignKey: 'admin_id', as: 'admin' });

// Event <-> ScheduleItem (1:N)
Event.hasMany(ScheduleItem, { foreignKey: 'event_id', as: 'schedules', onDelete: 'CASCADE' });
ScheduleItem.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Event <-> Guest (1:N)
Event.hasMany(Guest, { foreignKey: 'event_id', as: 'guests', onDelete: 'CASCADE' });
Guest.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Event <-> QRCode (1:1)
Event.hasOne(QRCode, { foreignKey: 'event_id', as: 'qrcode', onDelete: 'CASCADE' });
QRCode.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Guest <-> Companion (1:N)
Guest.hasMany(Companion, { foreignKey: 'guest_id', as: 'companions', onDelete: 'CASCADE' });
Companion.belongsTo(Guest, { foreignKey: 'guest_id', as: 'guest' });

// Guest <-> Confirmation (1:1)
Guest.hasOne(Confirmation, { foreignKey: 'guest_id', as: 'confirmation', onDelete: 'CASCADE' });
Confirmation.belongsTo(Guest, { foreignKey: 'guest_id', as: 'guest' });

// ScheduleItem <-> Photo (1:N)
ScheduleItem.hasMany(Photo, { foreignKey: 'schedule_item_id', as: 'photos', onDelete: 'CASCADE' });
Photo.belongsTo(ScheduleItem, { foreignKey: 'schedule_item_id', as: 'scheduleItem' });

// Event <-> Photo (1:N)
Event.hasMany(Photo, { foreignKey: 'event_id', as: 'photos', onDelete: 'CASCADE' });
Photo.belongsTo(Event, { foreignKey: 'event_id', as: 'event' });

// Photo <-> PhotoLike (1:N)
Photo.hasMany(PhotoLike, { foreignKey: 'photo_id', as: 'likes', onDelete: 'CASCADE' });
PhotoLike.belongsTo(Photo, { foreignKey: 'photo_id', as: 'photo' });

export {
  sequelize,
  Admin,
  Event,
  ScheduleItem,
  Guest,
  Companion,
  Confirmation,
  QRCode,
  Photo,
  PhotoLike
};
