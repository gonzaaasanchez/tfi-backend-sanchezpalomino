import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Config from '../src/models/Config';

dotenv.config();

// System configurations
const systemConfigs = [
  {
    key: 'system_commission',
    value: 6,
    type: 'number' as const,
    description: 'Comisión del sistema en porcentaje (ej: 6 = 6%)',
    isSystem: true,
  },
  // Add more configurations here as needed
  // {
  //   key: 'max_reservation_days',
  //   value: 30,
  //   type: 'number' as const,
  //   description: 'Máximo número de días para reservas futuras',
  //   isSystem: true,
  // },
  // {
  //   key: 'maintenance_mode',
  //   value: false,
  //   type: 'boolean' as const,
  //   description: 'Modo mantenimiento del sistema',
  //   isSystem: true,
  // },
];

async function createConfigs() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || '';
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Clear existing configs (optional - uncomment if you want to reset)
    // await Config.deleteMany({});
    // console.log('🗑️ Configuraciones existentes eliminadas');

    // Create or update each configuration
    for (const configData of systemConfigs) {
      try {
        const existingConfig = await Config.findOne({ key: configData.key });
        
        if (existingConfig) {
          // Update existing config
          existingConfig.value = configData.value;
          existingConfig.type = configData.type;
          existingConfig.description = configData.description;
          existingConfig.isSystem = configData.isSystem;
          
          await existingConfig.save();
          console.log(`🔄 Configuración '${configData.key}' actualizada`);
        } else {
          // Create new config
          const newConfig = new Config(configData);
          await newConfig.save();
          console.log(`✅ Configuración '${configData.key}' creada`);
        }
      } catch (error) {
        console.error(`❌ Error al procesar configuración '${configData.key}':`, error);
      }
    }

    // Display all configurations
    const allConfigs = await Config.find().sort({ key: 1 });
    console.log('\n📋 Configuraciones del sistema:');
    allConfigs.forEach(config => {
      console.log(`  - ${config.key}: ${config.value} (${config.type}) - ${config.description}`);
    });

    console.log('\n🎉 Script de configuraciones completado exitosamente');
  } catch (error) {
    console.error('❌ Error en el script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Run the script
createConfigs(); 