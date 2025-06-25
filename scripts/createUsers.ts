import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../src/models/User';
import Role from '../src/models/Role';
import PetType from '../src/models/PetType';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Nombres argentinos comunes
const nombresArgentinos = [
  'Santiago', 'Mateo', 'Lucas', 'Benjamín', 'Thiago',
  'Agustín', 'Pedro', 'Tomás', 'Juan', 'Nicolás',
  'Sofía', 'Valentina', 'Isabella', 'Camila', 'Valeria',
  'Mariana', 'Gabriela', 'Victoria', 'Lucía', 'Martina',
  'Joaquín', 'Facundo', 'Alejandro', 'Maximiliano', 'Diego',
  'Ana', 'María', 'Florencia', 'Carolina', 'Daniela'
];

// Apellidos argentinos comunes
const apellidosArgentinos = [
  'González', 'Rodríguez', 'Gómez', 'Fernández', 'López',
  'Díaz', 'Martínez', 'Pérez', 'García', 'Sánchez',
  'Romero', 'Sosa', 'Torres', 'Álvarez', 'Ruiz',
  'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Silva',
  'Rojas', 'Molina', 'Herrera', 'Cruz', 'Morales',
  'Gutiérrez', 'Ortiz', 'Moreno', 'Jiménez', 'Paz'
];

// Direcciones en Rosario (con coordenadas aproximadas)
const direccionesRosario = [
  {
    name: 'Casa',
    fullAddress: 'San Martín 1234, Rosario, Santa Fe',
    coords: { lat: -32.9468, lon: -60.6393 }
  },
  {
    name: 'Casa',
    fullAddress: 'Córdoba 567, Rosario, Santa Fe',
    coords: { lat: -32.9474, lon: -60.6398 }
  },
  {
    name: 'Casa',
    fullAddress: 'Entre Ríos 890, Rosario, Santa Fe',
    coords: { lat: -32.9480, lon: -60.6403 }
  },
  {
    name: 'Casa',
    fullAddress: 'Santa Fe 123, Rosario, Santa Fe',
    coords: { lat: -32.9486, lon: -60.6408 }
  },
  {
    name: 'Casa',
    fullAddress: 'Corrientes 456, Rosario, Santa Fe',
    coords: { lat: -32.9492, lon: -60.6413 }
  },
  {
    name: 'Casa',
    fullAddress: 'Paraguay 789, Rosario, Santa Fe',
    coords: { lat: -32.9498, lon: -60.6418 }
  },
  {
    name: 'Casa',
    fullAddress: 'Buenos Aires 321, Rosario, Santa Fe',
    coords: { lat: -32.9504, lon: -60.6423 }
  },
  {
    name: 'Casa',
    fullAddress: 'Mitre 654, Rosario, Santa Fe',
    coords: { lat: -32.9510, lon: -60.6428 }
  },
  {
    name: 'Casa',
    fullAddress: 'Belgrano 987, Rosario, Santa Fe',
    coords: { lat: -32.9516, lon: -60.6433 }
  },
  {
    name: 'Casa',
    fullAddress: 'Sarmiento 147, Rosario, Santa Fe',
    coords: { lat: -32.9522, lon: -60.6438 }
  },
  {
    name: 'Casa',
    fullAddress: 'Rivadavia 258, Rosario, Santa Fe',
    coords: { lat: -32.9528, lon: -60.6443 }
  },
  {
    name: 'Casa',
    fullAddress: 'Moreno 369, Rosario, Santa Fe',
    coords: { lat: -32.9534, lon: -60.6448 }
  },
  {
    name: 'Casa',
    fullAddress: 'Laprida 741, Rosario, Santa Fe',
    coords: { lat: -32.9540, lon: -60.6453 }
  },
  {
    name: 'Casa',
    fullAddress: 'Mendoza 852, Rosario, Santa Fe',
    coords: { lat: -32.9546, lon: -60.6458 }
  },
  {
    name: 'Casa',
    fullAddress: 'San Juan 963, Rosario, Santa Fe',
    coords: { lat: -32.9552, lon: -60.6463 }
  },
  {
    name: 'Casa',
    fullAddress: 'Catamarca 159, Rosario, Santa Fe',
    coords: { lat: -32.9558, lon: -60.6468 }
  },
  {
    name: 'Casa',
    fullAddress: 'La Rioja 357, Rosario, Santa Fe',
    coords: { lat: -32.9564, lon: -60.6473 }
  },
  {
    name: 'Casa',
    fullAddress: 'Tucumán 468, Rosario, Santa Fe',
    coords: { lat: -32.9570, lon: -60.6478 }
  },
  {
    name: 'Casa',
    fullAddress: 'Salta 579, Rosario, Santa Fe',
    coords: { lat: -32.9576, lon: -60.6483 }
  },
  {
    name: 'Casa',
    fullAddress: 'Jujuy 680, Rosario, Santa Fe',
    coords: { lat: -32.9582, lon: -60.6488 }
  }
];

// Función para normalizar texto (remover acentos y caracteres especiales)
function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ''); // Solo letras y números
}

// Función para obtener un elemento aleatorio de un array
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para generar configuración de cuidado aleatoria
function generateRandomCarerConfig(allPetTypeIds: mongoose.Types.ObjectId[]) {
  const configs = [
    // Sin configuración
    null,
    // Solo homeCare
    {
      homeCare: {
        enabled: true,
        dayPrice: Math.floor(Math.random() * 5000) + 2000 // $2000-$7000
      },
      petHomeCare: {
        enabled: false
      },
      petTypes: allPetTypeIds // Asignar todos los tipos de mascotas
    },
    // Solo petHomeCare
    {
      homeCare: {
        enabled: false
      },
      petHomeCare: {
        enabled: true,
        visitPrice: Math.floor(Math.random() * 2000) + 1000 // $1000-$3000
      },
      petTypes: allPetTypeIds // Asignar todos los tipos de mascotas
    },
    // Ambas habilitadas
    {
      homeCare: {
        enabled: true,
        dayPrice: Math.floor(Math.random() * 5000) + 2000 // $2000-$7000
      },
      petHomeCare: {
        enabled: true,
        visitPrice: Math.floor(Math.random() * 2000) + 1000 // $1000-$3000
      },
      petTypes: allPetTypeIds // Asignar todos los tipos de mascotas
    }
  ];

  return getRandomElement(configs);
}

// Función para generar número de teléfono argentino
function generatePhoneNumber(): string {
  const prefixes = ['11', '15', '341', '342', '343', '344', '345', '346', '347', '348', '349'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(Math.random() * 90000000) + 10000000; // 8 dígitos
  return `+54${prefix}${number}`;
}

async function createUsers() {
  try {
    // Conectar a MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está definida en las variables de entorno');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // Obtener el rol de usuario (asumiendo que existe un rol "user" o "usuario")
    const userRole = await Role.findOne({ name: { $in: ['user', 'usuario', 'User', 'Usuario'] } });
    if (!userRole) {
      throw new Error('No se encontró un rol de usuario. Asegúrate de que exista un rol "user" o "usuario"');
    }

    console.log(`✅ Rol encontrado: ${userRole.name}`);

    // Obtener todos los tipos de mascotas disponibles
    const allPetTypes = await PetType.find({});
    if (allPetTypes.length === 0) {
      console.log('⚠️  No se encontraron tipos de mascotas en la base de datos');
    } else {
      console.log(`✅ Se encontraron ${allPetTypes.length} tipos de mascotas: ${allPetTypes.map(pt => pt.name).join(', ')}`);
    }

    const allPetTypeIds = allPetTypes.map(pt => pt._id as mongoose.Types.ObjectId);

    // Crear 20 usuarios
    const usersToCreate: any[] = [];
    const usedEmails = new Set();

    for (let i = 0; i < 20; i++) {
      let nombre, apellido, email;
      
      // Generar email único
      do {
        nombre = getRandomElement(nombresArgentinos);
        apellido = getRandomElement(apellidosArgentinos);
        const nombreNormalizado = normalizeText(nombre);
        const apellidoNormalizado = normalizeText(apellido);
        email = `${nombreNormalizado}@${apellidoNormalizado}.com`;
      } while (usedEmails.has(email));
      
      usedEmails.add(email);

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash('123456', 10);

      // Generar dirección aleatoria
      const direccion = getRandomElement(direccionesRosario);

      // Generar configuración de cuidado aleatoria (con tipos de mascotas si está habilitada)
      const carerConfig = generateRandomCarerConfig(allPetTypeIds);

      const user = {
        firstName: nombre,
        lastName: apellido,
        email,
        password: hashedPassword,
        phoneNumber: generatePhoneNumber(),
        role: userRole._id,
        carerConfig,
        addresses: [direccion]
      };

      usersToCreate.push(user);
    }

    // Insertar usuarios en la base de datos
    const createdUsers = await User.insertMany(usersToCreate);

    console.log(`✅ Se crearon ${createdUsers.length} usuarios exitosamente:`);
    
    // Mostrar información de los usuarios creados
    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} - ${user.email}`);
      console.log(`   Teléfono: ${user.phoneNumber}`);
      console.log(`   Dirección: ${user.addresses?.[0]?.fullAddress || 'Sin dirección'}`);
      if (user.carerConfig) {
        if (user.carerConfig.homeCare?.enabled) {
          console.log(`   HomeCare: Habilitado - $${user.carerConfig.homeCare.dayPrice}/día`);
        }
        if (user.carerConfig.petHomeCare?.enabled) {
          console.log(`   PetHomeCare: Habilitado - $${user.carerConfig.petHomeCare.visitPrice}/visita`);
        }
        if (user.carerConfig.petTypes && user.carerConfig.petTypes.length > 0) {
          console.log(`   Tipos de mascotas: ${user.carerConfig.petTypes.length} tipos asignados`);
        }
      } else {
        console.log(`   Configuración de cuidado: Sin configurar`);
      }
      console.log('');
    });

    console.log('🎉 Script completado exitosamente!');
    console.log('📝 Contraseña para todos los usuarios: 123456');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

// Ejecutar el script
createUsers(); 