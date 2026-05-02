import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PhotoLike = sequelize.define('PhotoLike', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  photo_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'photos',
      key: 'id'
    }
  },
  visitor_id: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'ID de sessão ou fingerprint do dispositivo'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: true,
  },
}, {
  tableName: 'photo_likes',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default PhotoLike;
