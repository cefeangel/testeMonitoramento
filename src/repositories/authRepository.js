import { Admin } from '../models/index.js';

export const createAdmin = async (adminData) => {
  return Admin.create(adminData);
};

export const findAdminByEmail = async (email) => {
  return Admin.findOne({ where: { email } });
};

export const findAdminById = async (id) => {
  return Admin.findByPk(id);
};

export const updateAdmin = async (id, data) => {
  const admin = await Admin.findByPk(id);
  if (admin) {
    return admin.update(data);
  }
  return null;
};
