import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QRCode = sequelize.define('QRCode', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  event_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    unique: true,
  },
  token: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
  },
  url_publica: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  qrcode_path: {
    type: DataTypes.STRING(500),
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  tableName: 'qrcodes',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default QRCode;
