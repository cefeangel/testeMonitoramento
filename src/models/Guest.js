import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Guest = sequelize.define('Guest', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  nome_completo: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  telefone: {
    type: DataTypes.STRING(25),
    allowNull: false,
  },
}, {
  tableName: 'guests',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Guest;
