import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Event = sequelize.define('Event', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  admin_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  nome: {
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
  capacidade_total: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  foto_capa: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  max_dependentes_por_convidado: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  tableName: 'events',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Event;
