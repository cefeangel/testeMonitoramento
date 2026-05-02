import crypto from 'crypto';
import QRCodeLib from 'qrcode';
import fs from 'fs';
import path from 'path';
import * as qrcodeRepository from '../repositories/qrcodeRepository.js';
import * as eventService from './eventService.js';
import { AppError } from '../utils/AppError.js';
import dotenv from 'dotenv';
dotenv.config();

export const generateQRCodeForEvent = async (adminId, eventId, expiresAtStr, fotoCapa = null, dynamicBaseUrl = null) => {
  await eventService.getEventById(adminId, eventId);

  // Se uma capa foi enviada, atualiza o evento
  if (fotoCapa) {
    await eventService.updateEvent(adminId, eventId, { foto_capa: fotoCapa });
  }

  const expires_at = new Date(expiresAtStr);
  if (expires_at <= new Date()) {
    throw new AppError('A data de expiração deve ser futura', 400);
  }

  const token = crypto.randomUUID();
  
  // Lógica de URL Inteligente:
  // Se o BASE_URL for um IP local ou localhost, e a requisição vier de um domínio real, 
  // damos prioridade ao domínio da requisição para que o QR Code funcione externamente.
  const isLocal = (url) => url.includes('localhost') || url.includes('127.0.0.1') || url.match(/^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}/);
  
  let baseUrl = process.env.BASE_URL || 'http://localhost:8752';
  
  if (isLocal(baseUrl) && dynamicBaseUrl && !isLocal(dynamicBaseUrl)) {
    baseUrl = dynamicBaseUrl;
  }

  const url_publica = `${baseUrl}/event-guest.html?eventId=${eventId}&token=${token}`;

  // Gera o arquivo do QRCode em PNG
  const filename = `${eventId}-${token}.png`;
  const qrcode_path = path.join('uploads', 'qrcodes', filename);
  const qrcode_absolute_path = path.resolve(qrcode_path);

  await QRCodeLib.toFile(qrcode_absolute_path, url_publica);
  
  // Base64 em memória
  const qrCodeBase64 = await QRCodeLib.toDataURL(url_publica);

  const qrData = await qrcodeRepository.createOrUpdateQRCode({
    event_id: eventId,
    token,
    url_publica,
    qrcode_path,
    expires_at
  });

  return {
    url: url_publica,
    qrCodeBase64,
    qrCodeImageUrl: `/${qrcode_path.replace(/\\/g, '/')}`,
    expiresAt: qrData.expires_at
  };
};

export const getEventQRCode = async (adminId, eventId) => {
  await eventService.getEventById(adminId, eventId);
  const qr = await qrcodeRepository.findQRCodeByEventId(eventId);
  
  if (!qr) {
    throw new AppError('QR Code não encontrado', 404);
  }

  return qr;
};

export const getEventQRCodeDownload = async (adminId, eventId) => {
  const qr = await getEventQRCode(adminId, eventId);
  return path.resolve(qr.qrcode_path);
};
