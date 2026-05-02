import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Companion = sequelize.define('Companion', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  guest_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  nome_completo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
}, {
  tableName: 'companions',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
});

export default Companion;
