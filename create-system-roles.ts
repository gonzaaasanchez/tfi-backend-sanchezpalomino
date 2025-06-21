import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './src/models/Role';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tfi-backend';

async function createSystemRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    // SUPERADMIN: todos los permisos en true
    const superadminData = {
      name: 'superadmin',
      description: 'Rol con acceso total a todo el sistema',
      permissions: {
        users: { create: true, read: true, update: true, delete: true, getAll: true },
        roles: { create: true, read: true, update: true, delete: true, getAll: true },
        admins: { create: true, read: true, update: true, delete: true, getAll: true }
      },
      isSystem: true
    };

    // USER: todos los permisos en false
    const userData = {
      name: 'user',
      description: 'Rol básico, solo acceso a rutas de autenticación',
      permissions: {
        users: { create: false, read: false, update: false, delete: false, getAll: false },
        roles: { create: false, read: false, update: false, delete: false, getAll: false },
        admins: { create: false, read: false, update: false, delete: false, getAll: false }
      },
      isSystem: true
    };

    // Crear o actualizar superadmin
    const superadmin = await Role.findOneAndUpdate(
      { name: 'superadmin' },
      superadminData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Rol superadmin creado/actualizado');

    // Crear o actualizar user
    const user = await Role.findOneAndUpdate(
      { name: 'user' },
      userData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('✅ Rol user creado/actualizado');

    console.log('✅ Roles del sistema listos');
  } catch (error) {
    console.error('❌ Error creando roles del sistema:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
  }
}

createSystemRoles(); 