import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './src/models/Role';

dotenv.config();

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tfi-backend')
  .then(() => console.log('Conectado a MongoDB'))
  .catch(err => console.error('Error conectando a MongoDB:', err));

async function updateRolesPermissions() {
  try {
    console.log('Actualizando permisos de roles...');
    
    // Obtener todos los roles
    const roles = await Role.find();
    
    for (const role of roles) {
      // Agregar permisos de admins si no existen
      if (!role.permissions.admins) {
        role.permissions.admins = {
          create: false,
          read: false,
          update: false,
          delete: false,
          getAll: false
        };
        
        // Si es superadmin, dar todos los permisos
        if (role.name === 'superadmin') {
          role.permissions.admins = {
            create: true,
            read: true,
            update: true,
            delete: true,
            getAll: true
          };
        }
        
        await role.save();
        console.log(`✅ Rol "${role.name}" actualizado con permisos de admins`);
      } else {
        console.log(`ℹ️  Rol "${role.name}" ya tiene permisos de admins`);
      }
    }
    
    console.log('✅ Todos los roles han sido actualizados exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando roles:', error);
  } finally {
    mongoose.connection.close();
    console.log('Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
updateRolesPermissions(); 