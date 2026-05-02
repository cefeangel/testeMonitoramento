import bcrypt from 'bcrypt';
import * as authRepository from '../repositories/authRepository.js';
import { generateToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const registerAdmin = async (adminData) => {
  const { nome, email, senha } = adminData;

  const adminExists = await authRepository.findAdminByEmail(email);
  if (adminExists) {
    throw new AppError('Email já está em uso', 400);
  }

  const saltRounds = 10;
  const hash = await bcrypt.hash(senha, saltRounds);

  const admin = await authRepository.createAdmin({
    nome,
    email,
    senha_hash: hash,
  });

  return {
    id: admin.id,
    nome: admin.nome,
    email: admin.email,
  };
};

export const loginAdmin = async (email, senha) => {
  const admin = await authRepository.findAdminByEmail(email);
  if (!admin) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const match = await bcrypt.compare(senha, admin.senha_hash);
  if (!match) {
    throw new AppError('Credenciais inválidas', 401);
  }

  const accessToken = generateToken({ adminId: admin.id });

  return {
    accessToken,
    admin: {
      id: admin.id,
      nome: admin.nome,
      email: admin.email,
    }
  };
};
export const getAdminProfile = async (adminId) => {
  const admin = await authRepository.findAdminById(adminId);
  if (!admin) throw new AppError('Admin não encontrado', 404);
  return { id: admin.id, nome: admin.nome, email: admin.email };
};

export const updateAdminProfile = async (adminId, data) => {
  const updateData = { nome: data.nome, email: data.email };
  
  if (data.senha && data.senha.trim() !== '') {
    const saltRounds = 10;
    updateData.senha_hash = await bcrypt.hash(data.senha, saltRounds);
  }
  
  const updated = await authRepository.updateAdmin(adminId, updateData);
  if (!updated) throw new AppError('Erro ao atualizar perfil', 500);

  return {
    id: updated.id,
    nome: updated.nome,
    email: updated.email,
  };
};
