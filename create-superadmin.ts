import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './src/models/Role';
import Admin from './src/models/Admin';
import { hashPassword } from './src/utils/auth';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tfi-backend';

async function createSuperadmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Conectado a MongoDB');

    // 1. Asegurar que existe el rol superadmin
    const superadminRole = await Role.findOne({ name: 'superadmin' });
    if (!superadminRole) {
      console.log('❌ El rol superadmin no existe. Ejecuta primero create-system-roles.ts');
      return;
    }
    console.log('✅ Rol superadmin encontrado');

    // 2. Verificar si ya existe un superadmin
    const existingSuperadmin = await Admin.findOne({ email: 'super@admin.com' });
    if (existingSuperadmin) {
      console.log('⚠️  Ya existe un superadmin con ese email');
      return;
    }

    // 3. Crear el superadmin
    const hashedPassword = await hashPassword('123456');
    
    const superadmin = new Admin({
      firstName: 'super',
      lastName: 'admin',
      email: 'super@admin.com',
      password: hashedPassword,
      role: superadminRole._id
    });

    await superadmin.save();
    console.log('✅ Superadmin creado exitosamente');
    console.log('📧 Email: super@admin.com');
    console.log('🔑 Contraseña: 123456');

  } catch (error) {
    console.error('❌ Error creando superadmin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
  }
}

createSuperadmin(); 