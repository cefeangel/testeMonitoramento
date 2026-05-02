import { QRCode } from '../models/index.js';

export const createOrUpdateQRCode = async (qrCodeData) => {
  const event_id = qrCodeData.event_id;
  
  const existing = await QRCode.findOne({ where: { event_id } });
  
  if (existing) {
    return existing.update(qrCodeData);
  }
  
  return QRCode.create(qrCodeData);
};

export const findQRCodeByEventId = async (event_id) => {
  return QRCode.findOne({ where: { event_id } });
};
