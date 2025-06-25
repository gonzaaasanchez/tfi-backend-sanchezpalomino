import mongoose from 'mongoose';
import Pet from '../src/models/Pet';
import User from '../src/models/User';
import PetType from '../src/models/PetType';
import PetCharacteristic from '../src/models/PetCharacteristic';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Nombres divertidos para mascotas
const nombresMascotas = [
  // Perros
  'Luna', 'Rocky', 'Max', 'Bella', 'Toby', 'Lola', 'Charlie', 'Mia', 'Buddy', 'Daisy',
  'Cooper', 'Lucy', 'Bear', 'Molly', 'Duke', 'Sadie', 'Jack', 'Sophie', 'Baxter', 'Ruby',
  'Rex', 'Zoe', 'Oscar', 'Penny', 'Finn', 'Chloe', 'Murphy', 'Rosie', 'Winston', 'Lily',
  
  // Gatos
  'Whiskers', 'Shadow', 'Mittens', 'Fluffy', 'Tiger', 'Smokey', 'Boots', 'Simba', 'Nala', 'Leo',
  'Milo', 'Bella', 'Oliver', 'Luna', 'Jasper', 'Chloe', 'Felix', 'Sophie', 'Max', 'Lucy',
  'Charlie', 'Daisy', 'Jack', 'Mia', 'Sam', 'Ruby', 'Tommy', 'Zoe', 'Buddy', 'Penny',
  
  // Otros animales
  'Nibbles', 'Fluffy', 'Pepper', 'Coco', 'Pixie', 'Sparky', 'Gizmo', 'Peanut', 'Marshmallow', 'Cookie',
  'Biscuit', 'Honey', 'Caramel', 'Buttercup', 'Sunny', 'Rainbow', 'Stardust', 'Twinkle', 'Magic', 'Dream'
];

// Descripciones graciosas para mascotas
const descripcionesGraciosas = [
  'Se cree que es el dueño de la casa y nos permite vivir aquí',
  'Tiene un doctorado en dormir y una maestría en roncar',
  'Especialista en encontrar el lugar más incómodo para sentarse',
  'Experto en hacer caras de culpable después de hacer travesuras',
  'Campeón mundial en perseguir su propia cola',
  'Tiene un negocio secreto de guardar calcetines',
  'Especialista en despertar a toda la familia a las 3 AM',
  'Tiene un club de fans invisible que lo sigue por toda la casa',
  'Experto en hacer que la comida de los humanos sepa mejor',
  'Campeón en hacer caras de "yo no fui"',
  'Especialista en encontrar el lugar más cálido de la casa',
  'Tiene un doctorado en hacer que los humanos se sientan culpables',
  'Experto en convertir cualquier objeto en juguete',
  'Campeón en hacer que los vecinos se pregunten qué está pasando',
  'Especialista en hacer que los humanos hablen en voz alta',
  'Tiene un negocio de limpieza de platos (los lame todos)',
  'Experto en hacer que los humanos se rindan y den más comida',
  'Campeón en hacer que los humanos se sientan observados',
  'Especialista en convertir cualquier momento en hora de juego',
  'Tiene un doctorado en hacer que los humanos se sientan amados'
];

// Valores para características de mascotas (más flexibles)
const valoresCaracteristicas: { [key: string]: string[] } = {
  'Tamaño': ['Pequeño', 'Mediano', 'Grande', 'Enorme'],
  'Edad': ['Cachorro', 'Joven', 'Adulto', 'Senior'],
  'Medicación': ['Ninguna', 'Ocasional', 'Regular', 'Diaria', 'Especial'],
  'Personalidad': ['Muy amigable', 'Amigable', 'Reservado', 'Tímido', 'Protector', 'Independiente'],
  'Alimento': ['Balanceado', 'Natural', 'Mixto', 'Especial', 'Húmedo', 'Seco'],
  'Energía': ['Muy tranquilo', 'Tranquilo', 'Activo', 'Muy activo', 'Hiperactivo'],
  'Temperamento': ['Muy amigable', 'Amigable', 'Reservado', 'Tímido', 'Protector'],
  'Socialización': ['Muy sociable', 'Sociable', 'Independiente', 'Tímido con extraños'],
  'Entrenamiento': ['Muy fácil', 'Fácil', 'Moderado', 'Difícil', 'Muy difícil'],
  'Ejercicio': ['Poco ejercicio', 'Ejercicio moderado', 'Mucho ejercicio', 'Ejercicio intenso'],
  'Cuidado': ['Bajo mantenimiento', 'Mantenimiento moderado', 'Alto mantenimiento'],
  'Salud': ['Muy saludable', 'Saludable', 'Algunos problemas', 'Necesita cuidados especiales'],
  'Comportamiento': ['Muy bien educado', 'Bien educado', 'Algo travieso', 'Muy travieso'],
  'Relación con niños': ['Excelente', 'Buena', 'Moderada', 'Requiere supervisión'],
  'Relación con otros animales': ['Excelente', 'Buena', 'Moderada', 'Requiere introducción lenta'],
  'Adaptabilidad': ['Muy adaptable', 'Adaptable', 'Necesita tiempo', 'Muy sensible a cambios'],
  'Inteligencia': ['Muy inteligente', 'Inteligente', 'Promedio', 'Necesita paciencia'],
  'Lealtad': ['Muy leal', 'Leal', 'Independiente', 'A veces distante']
};

// Función para obtener un elemento aleatorio de un array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para obtener un número aleatorio entre min y max
function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Función para generar características aleatorias para una mascota
function generateRandomCharacteristics(allCharacteristics: any[]): Array<{ characteristic: mongoose.Types.ObjectId; value: string }> {
  const numCharacteristics = getRandomNumber(3, 10); // 3 a 10 características
  const selectedCharacteristics: Array<{ characteristic: mongoose.Types.ObjectId; value: string }> = [];
  const shuffled = [...allCharacteristics].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < numCharacteristics && i < shuffled.length; i++) {
    const characteristic = shuffled[i];
    const possibleValues = valoresCaracteristicas[characteristic.name] || ['Sí', 'No', 'A veces', 'Ocasional', 'Regular'];
    const value = getRandomElement(possibleValues);
    
    selectedCharacteristics.push({
      characteristic: characteristic._id as mongoose.Types.ObjectId,
      value: value
    });
  }
  
  return selectedCharacteristics;
}

// Función para generar descripción graciosa (opcional)
function generateFunnyDescription(): string | undefined {
  // 70% de probabilidad de tener descripción graciosa
  if (Math.random() < 0.7) {
    return getRandomElement(descripcionesGraciosas);
  }
  return undefined;
}

async function createPets() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los usuarios
    const users = await User.find({});
    if (users.length === 0) {
      throw new Error('No se encontraron usuarios en la base de datos');
    }

    console.log(`✅ Se encontraron ${users.length} usuarios`);

    // Obtener todos los tipos de mascotas
    const petTypes = await PetType.find({});
    if (petTypes.length === 0) {
      throw new Error('No se encontraron tipos de mascotas en la base de datos');
    }

    console.log(`✅ Se encontraron ${petTypes.length} tipos de mascotas: ${petTypes.map(pt => pt.name).join(', ')}`);

    // Obtener todas las características de mascotas
    const characteristics = await PetCharacteristic.find({});
    if (characteristics.length === 0) {
      throw new Error('No se encontraron características de mascotas en la base de datos');
    }

    console.log(`✅ Se encontraron ${characteristics.length} características: ${characteristics.map(c => c.name).join(', ')}`);

    // Crear mascotas para cada usuario
    const petsToCreate: any[] = [];
    let totalPetsCreated = 0;

    for (const user of users) {
      // Cada usuario tendrá entre 1 y 4 mascotas
      const numPets = getRandomNumber(1, 4);
      
      for (let i = 0; i < numPets; i++) {
        const petName = getRandomElement(nombresMascotas);
        const petType = getRandomElement(petTypes);
        const petCharacteristics = generateRandomCharacteristics(characteristics);
        const comment = generateFunnyDescription();

        const pet = {
          name: petName,
          comment: comment,
          petType: petType._id,
          characteristics: petCharacteristics,
          owner: user._id
        };

        petsToCreate.push(pet);
        totalPetsCreated++;
      }
    }

    // Insertar mascotas en la base de datos
    const createdPets = await Pet.insertMany(petsToCreate);

    console.log(`✅ Se crearon ${createdPets.length} mascotas exitosamente:`);
    
    // Mostrar información de las mascotas creadas
    let userIndex = 0;
    for (const user of users) {
      const userPets = createdPets.filter(pet => pet.owner.toString() === (user._id as mongoose.Types.ObjectId).toString());
      
      if (userPets.length > 0) {
        console.log(`\n👤 ${user.firstName} ${user.lastName} (${userPets.length} mascota${userPets.length > 1 ? 's' : ''}):`);
        
        userPets.forEach((pet, index) => {
          const petType = petTypes.find(pt => (pt._id as mongoose.Types.ObjectId).toString() === pet.petType.toString());
          console.log(`   ${index + 1}. ${pet.name} (${petType?.name || 'Tipo desconocido'})`);
          console.log(`      Características: ${pet.characteristics.length} características`);
          if (pet.comment) {
            console.log(`      Descripción: ${pet.comment}`);
          }
        });
      }
    }

    console.log('\n🎉 Script completado exitosamente!');
    console.log(`📊 Resumen: ${users.length} usuarios, ${totalPetsCreated} mascotas creadas`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
createPets(); 