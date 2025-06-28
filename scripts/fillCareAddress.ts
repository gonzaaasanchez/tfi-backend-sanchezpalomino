import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está configurada en las variables de entorno');
  process.exit(1);
}

async function fillCareAddress() {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Conectado a MongoDB exitosamente');

    // Find users that have care enabled but no careAddress
    const usersToUpdate = await User.find({
      $and: [
        {
          $or: [
            { 'carerConfig.homeCare.enabled': true },
            { 'carerConfig.petHomeCare.enabled': true }
          ]
        },
        {
          $or: [
            { 'carerConfig.careAddress': { $exists: false } },
            { 'carerConfig.careAddress': null },
            { 'carerConfig.careAddress': undefined }
          ]
        },
        {
          addresses: { $exists: true, $ne: [] }
        }
      ]
    });

    console.log(`📊 Encontrados ${usersToUpdate.length} usuarios para actualizar`);

    if (usersToUpdate.length === 0) {
      console.log('✅ No hay usuarios que necesiten actualización');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const user of usersToUpdate) {
      try {
        // Get the first address
        const firstAddress = user.addresses?.[0];
        
        if (!firstAddress) {
          console.log(`⚠️  Usuario ${user.email} no tiene direcciones, saltando...`);
          skippedCount++;
          continue;
        }

        // Update the user with the first address as careAddress
        await User.findByIdAndUpdate(
          user._id,
          {
            'carerConfig.careAddress': firstAddress._id
          }
        );

        console.log(`✅ Actualizado usuario: ${user.email} - Dirección: ${firstAddress.name}`);
        updatedCount++;

      } catch (error) {
        console.error(`❌ Error actualizando usuario ${user.email}:`, error);
        skippedCount++;
      }
    }

    console.log('\n📈 Resumen de la actualización:');
    console.log(`✅ Usuarios actualizados: ${updatedCount}`);
    console.log(`⚠️  Usuarios saltados: ${skippedCount}`);
    console.log(`📊 Total procesados: ${usersToUpdate.length}`);

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Run the script
fillCareAddress()
  .then(() => {
    console.log('🎉 Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }); 