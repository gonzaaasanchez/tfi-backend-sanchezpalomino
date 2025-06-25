import mongoose from 'mongoose';
import PetCharacteristic from '../src/models/PetCharacteristic';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Características que ya tienes
const caracteristicasExistentes = [
  'Tamaño',
  'Edad', 
  'Medicación',
  'Personalidad',
  'Alimento'
];

// Características adicionales que necesitamos para el script de mascotas
const caracteristicasAdicionales = [
  'Energía',
  'Temperamento',
  'Socialización',
  'Entrenamiento',
  'Ejercicio',
  'Cuidado',
  'Salud',
  'Comportamiento',
  'Relación con niños',
  'Relación con otros animales',
  'Adaptabilidad',
  'Inteligencia',
  'Lealtad'
];

async function createPetCharacteristics() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Obtener características existentes
    const existingCharacteristics = await PetCharacteristic.find({});
    console.log(`✅ Se encontraron ${existingCharacteristics.length} características existentes:`);
    existingCharacteristics.forEach(char => {
      console.log(`   - ${char.name}`);
    });

    // Filtrar características que no existen
    const existingNames = existingCharacteristics.map(char => char.name);
    const characteristicsToCreate = caracteristicasAdicionales.filter(
      name => !existingNames.includes(name)
    );

    if (characteristicsToCreate.length === 0) {
      console.log('✅ Todas las características ya existen en la base de datos');
      return;
    }

    console.log(`\n📝 Se van a crear ${characteristicsToCreate.length} características nuevas:`);
    characteristicsToCreate.forEach(name => {
      console.log(`   - ${name}`);
    });

    // Crear las características faltantes
    const characteristicsToInsert = characteristicsToCreate.map(name => ({ name }));
    const createdCharacteristics = await PetCharacteristic.insertMany(characteristicsToInsert);

    console.log(`\n✅ Se crearon ${createdCharacteristics.length} características exitosamente:`);
    createdCharacteristics.forEach(char => {
      console.log(`   - ${char.name}`);
    });

    // Mostrar resumen final
    const allCharacteristics = await PetCharacteristic.find({});
    console.log(`\n📊 Resumen final: ${allCharacteristics.length} características en total`);
    console.log('🎉 Script completado exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
createPetCharacteristics(); 