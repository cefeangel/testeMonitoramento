import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Confirmation = sequelize.define('Confirmation', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  guest_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('PENDENTE', 'CONFIRMADO', 'CANCELADO'),
    defaultValue: 'PENDENTE',
    allowNull: false,
  },
}, {
  tableName: 'confirmations',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Confirmation;
