import * as authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const adminData = await authService.registerAdmin(req.body);
    res.status(201).json({
      success: true,
      message: 'Admin registrado com sucesso',
      data: adminData
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const authData = await authService.loginAdmin(email, senha);
    
    // Configura o cookie com o token
    res.cookie('token', authData.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 dia
    });

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: authData
    });
  } catch (error) {
    next(error);
  }
};
export const getProfile = async (req, res, next) => {
  try {
    const profile = await authService.getAdminProfile(req.adminId);
    res.status(200).json({
      success: true,
      message: 'Perfil recuperado',
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateAdminProfile(req.adminId, req.body);
    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
