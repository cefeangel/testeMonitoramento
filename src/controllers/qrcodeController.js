import * as qrcodeService from '../services/qrcodeService.js';

export const generateQRCode = async (req, res, next) => {
  try {
    const dynamicBaseUrl = `${req.protocol}://${req.get('host')}`;
    
    const qrData = await qrcodeService.generateQRCodeForEvent(
      req.adminId,
      req.params.eventId,
      req.body.expires_at,
      req.body.foto_capa,
      dynamicBaseUrl
    );
    // Lógica solicitada: Se for localhost continua (relativo), caso contrário gera URL completa
    const protocol = req.protocol;
    const host = req.get('host');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || !!host.match(/^(\d{1,3}\.){3}\d{1,3}/);
    const baseUrlFormatted = isLocal ? '' : `${protocol}://${host}`;

    // Enriquece os dados com URLs amigáveis
    const qrcode_path_formatted = qrData.qrCodeImageUrl; // Já vem formatado como /uploads/...
    const full_qrcode_url = qrcode_path_formatted ? `${baseUrlFormatted}${qrcode_path_formatted}` : null;

    res.status(201).json({
      success: true,
      message: 'QR Code gerado com sucesso',
      data: {
        ...qrData,
        qrcode_url: full_qrcode_url
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getQRCode = async (req, res, next) => {
  try {
    const qr = await qrcodeService.getEventQRCode(req.adminId, req.params.eventId);
    
    // Lógica solicitada: Se for localhost continua (relativo), caso contrário gera URL completa
    const protocol = req.protocol;
    const host = req.get('host');
    const isLocal = host.includes('localhost') || host.includes('127.0.0.1') || !!host.match(/^(\d{1,3}\.){3}\d{1,3}/);
    const baseUrl = isLocal ? '' : `${protocol}://${host}`;
    
    // Formata o objeto de dados para incluir URLs completas se necessário
    const qrcode_path_formatted = qr.qrcode_path ? `/${qr.qrcode_path.replace(/\\/g, '/')}` : null;
    const full_qrcode_url = qrcode_path_formatted ? `${baseUrl}${qrcode_path_formatted}` : null;

    res.status(200).json({
      success: true,
      message: 'QR Code atual',
      data: {
        ...qr.toJSON(),
        qrcode_url: full_qrcode_url, // URL amigável (completa ou relativa)
        qrcode_path_display: qrcode_path_formatted
      }
    });
  } catch (error) {
    next(error);
  }
};

export const downloadQRCode = async (req, res, next) => {
  try {
    const filepath = await qrcodeService.getEventQRCodeDownload(req.adminId, req.params.eventId);
    res.download(filepath, 'qrcode.png');
  } catch (error) {
    next(error);
  }
};
