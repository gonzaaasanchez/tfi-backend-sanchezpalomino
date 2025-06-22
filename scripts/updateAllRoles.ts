import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../src/models/Role';

dotenv.config();

// Configuración de permisos para cada rol
const rolePermissions = {
  // Superadmin: acceso completo a todo
  superadmin: {
    petTypes: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: true,
    },
    petCharacteristics: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: true,
    },
    pets: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: true,
    },
  },
  // User: solo puede gestionar sus propias mascotas y ver tipos/características
  user: {
    petTypes: {
      create: false,
      read: true,
      update: false,
      delete: false,
      getAll: true,
    },
    petCharacteristics: {
      create: false,
      read: true,
      update: false,
      delete: false,
      getAll: true,
    },
    pets: {
      create: true,
      read: true,
      update: true,
      delete: true,
      getAll: false, // Solo ve sus propias mascotas
    },
  },
};

async function updateAllRoles() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Conexión exitosa a MongoDB');

    console.log('\n📋 Actualizando roles existentes...');

    // Obtener todos los roles existentes
    const existingRoles = await Role.find();
    console.log(`📊 Encontrados ${existingRoles.length} roles:`);
    existingRoles.forEach(role => {
      console.log(`  - ${role.name} (${role.isSystem ? 'Sistema' : 'Personalizado'})`);
    });

    let updatedCount = 0;

    for (const role of existingRoles) {
      console.log(`\n🔄 Procesando rol: ${role.name}`);

      // Mostrar permisos actuales
      console.log(`  📋 Permisos actuales:`);
      console.log(`     PetTypes.getAll: ${role.permissions.petTypes?.getAll || 'undefined'}`);
      console.log(`     PetCharacteristics.getAll: ${role.permissions.petCharacteristics?.getAll || 'undefined'}`);
      console.log(`     Pets.getAll: ${role.permissions.pets?.getAll || 'undefined'}`);

      // Determinar qué permisos asignar
      let newPermissions;
      
      if (role.name === 'superadmin') {
        newPermissions = rolePermissions.superadmin;
        console.log('  🔐 Asignando permisos de superadmin (acceso completo)');
      } else if (role.name === 'user') {
        newPermissions = rolePermissions.user;
        console.log('  👤 Asignando permisos de usuario (gestión propia)');
      } else {
        // Para roles personalizados, asignar permisos de usuario por defecto
        newPermissions = rolePermissions.user;
        console.log('  🎯 Asignando permisos de usuario por defecto');
      }

      // Actualizar los permisos del rol
      role.permissions.petTypes = newPermissions.petTypes;
      role.permissions.petCharacteristics = newPermissions.petCharacteristics;
      role.permissions.pets = newPermissions.pets;

      await role.save();
      updatedCount++;
      console.log(`  ✅ Rol ${role.name} actualizado exitosamente`);
    }

    console.log(`\n🎉 Proceso completado!`);
    console.log(`📈 Roles actualizados: ${updatedCount}/${existingRoles.length}`);

    // Mostrar resumen de permisos por rol
    console.log('\n📋 Resumen de permisos por rol:');
    const updatedRoles = await Role.find();
    
    for (const role of updatedRoles) {
      console.log(`\n🔸 ${role.name.toUpperCase()}:`);
      console.log(`   PetTypes: ${role.permissions.petTypes.getAll ? 'Ver todos' : 'Sin acceso'}`);
      console.log(`   PetCharacteristics: ${role.permissions.petCharacteristics.getAll ? 'Ver todos' : 'Sin acceso'}`);
      
      if (role.permissions.pets.create) {
        console.log(`   Pets: Crear, leer, actualizar, eliminar ${role.permissions.pets.getAll ? '(todas)' : '(propias)'}`);
      } else if (role.permissions.pets.read) {
        console.log(`   Pets: Solo lectura ${role.permissions.pets.getAll ? '(todas)' : '(propias)'}`);
      } else {
        console.log(`   Pets: Sin acceso`);
      }
    }

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
  }
}

// Ejecutar el script
updateAllRoles(); 