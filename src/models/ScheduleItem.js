import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ScheduleItem = sequelize.define('ScheduleItem', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  descricao: {
    type: DataTypes.TEXT,
  },
  data_hora: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  foto_url: {
    type: DataTypes.STRING(500),
  },
}, {
  tableName: 'schedule_items',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default ScheduleItem;
