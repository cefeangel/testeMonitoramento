import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  schedule_item_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
  },
  enviado_por: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  foto_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  media_type: {
    type: DataTypes.ENUM('IMAGE', 'VIDEO'),
    defaultValue: 'IMAGE',
    allowNull: false,
  },
  mimetype: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  likes_count: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  },
  thumbnail_url: {
    type: DataTypes.STRING(500),
  },
  uploaded_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  tableName: 'photos',
  timestamps: true,
  underscored: true,
  createdAt: 'uploaded_at',
  updatedAt: false,
});

export default Photo;
