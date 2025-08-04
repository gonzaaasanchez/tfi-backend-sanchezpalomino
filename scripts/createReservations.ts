import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Pet from '../src/models/Pet';
import PetType from '../src/models/PetType';
import Reservation, { IReservation } from '../src/models/Reservation';
import Review from '../src/models/Review';
import { RESERVATION_STATUS, CARE_LOCATION } from '../src/types';
import { logChanges } from '../src/utils/auditLogger';
import { calculateCommission } from '../src/utils/common';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gonzalosanchez:QT4KAbuD8thKzY0n@cluster0.tjtxlku.mongodb.net/tfi-sanchezpalomino';

// Datos de la consulta anterior
const GONZALO_ID = '6855f7a879c07ee2898525f7';

interface CaregiverData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  homeCare: { enabled: boolean; dayPrice?: number };
  petHomeCare: { enabled: boolean; visitPrice?: number };
  petTypes: string[];
  careAddress: any;
}

interface OwnerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pets: any[];
}

interface PetData {
  id: string;
  name: string;
  petType: string;
  owner: string;
}

// Datos hardcodeados de la consulta anterior
const caregivers: CaregiverData[] = [
  {
    id: '6855f7a879c07ee2898525f7',
    firstName: 'Gonzalo',
    lastName: 'Sanchez',
    email: 'gonza.sanchez@gmail.com',
    homeCare: { enabled: true, dayPrice: 1 },
    petHomeCare: { enabled: true, visitPrice: 2 },
    petTypes: ['685755d4b7ee9fe8c31a7736', '685755dbb7ee9fe8c31a773e'], // Gato, Hámster
    careAddress: { _id: '68585e8383100127c2b2e81b', name: 'Casa Principal', fullAddress: 'Av. Corrientes 1234, Rosario', coords: { lat: -32.9468, lon: -60.6393 } }
  },
  {
    id: '685b709c823da31e445fde56',
    firstName: 'Gabriela',
    lastName: 'Sánchez',
    email: 'gabriela@sanchez.com',
    homeCare: { enabled: false },
    petHomeCare: { enabled: true, visitPrice: 1758 },
    petTypes: ['685755cab7ee9fe8c31a772c', '685755d4b7ee9fe8c31a7736', '685755dbb7ee9fe8c31a773e', '685755f4b7ee9fe8c31a7746'],
    careAddress: { _id: '685b709c823da31e445fde58', name: 'Casa', fullAddress: 'San Martín 567, Rosario', coords: { lat: -32.9468, lon: -60.6393 } }
  },
  {
    id: '685b709c823da31e445fde59',
    firstName: 'Victoria',
    lastName: 'Rojas',
    email: 'victoria@rojas.com',
    homeCare: { enabled: true, dayPrice: 4656 },
    petHomeCare: { enabled: false },
    petTypes: ['685755cab7ee9fe8c31a772c', '685755d4b7ee9fe8c31a7736', '685755dbb7ee9fe8c31a773e', '685755f4b7ee9fe8c31a7746'],
    careAddress: { _id: '685b709c823da31e445fde5b', name: 'Departamento', fullAddress: 'Mitre 890, Rosario', coords: { lat: -32.9468, lon: -60.6393 } }
  },
  {
    id: '685b709c823da31e445fde65',
    firstName: 'Alejandro',
    lastName: 'Ruiz',
    email: 'alejandro@ruiz.com',
    homeCare: { enabled: false },
    petHomeCare: { enabled: true, visitPrice: 2133 },
    petTypes: ['685755cab7ee9fe8c31a772c', '685755d4b7ee9fe8c31a7736', '685755dbb7ee9fe8c31a773e', '685755f4b7ee9fe8c31a7746'],
    careAddress: { _id: '685b709c823da31e445fde67', name: 'Casa', fullAddress: 'Pellegrini 123, Rosario', coords: { lat: -32.9468, lon: -60.6393 } }
  },
  {
    id: '685b709c823da31e445fde6b',
    firstName: 'Agustín',
    lastName: 'López',
    email: 'agustin@lopez.com',
    homeCare: { enabled: false },
    petHomeCare: { enabled: true, visitPrice: 2255 },
    petTypes: ['685755cab7ee9fe8c31a772c', '685755d4b7ee9fe8c31a7736', '685755dbb7ee9fe8c31a773e', '685755f4b7ee9fe8c31a7746'],
    careAddress: { _id: '685b709c823da31e445fde6d', name: 'Casa', fullAddress: 'Córdoba 456, Rosario', coords: { lat: -32.9468, lon: -60.6393 } }
  }
];

const owners: OwnerData[] = [
  {
    id: '6855f7a879c07ee2898525f7',
    firstName: 'Gonzalo',
    lastName: 'Sanchez',
    email: 'gonza.sanchez@gmail.com',
    pets: ['pet1', 'pet2', 'pet3'] // IDs de mascotas de Gonzalo
  },
  {
    id: '685b709c823da31e445fde56',
    firstName: 'Gabriela',
    lastName: 'Sánchez',
    email: 'gabriela@sanchez.com',
    pets: ['pet4', 'pet5', 'pet6', 'pet7']
  },
  {
    id: '685b709c823da31e445fde59',
    firstName: 'Victoria',
    lastName: 'Rojas',
    email: 'victoria@rojas.com',
    pets: ['pet8', 'pet9']
  },
  {
    id: '685b709c823da31e445fde65',
    firstName: 'Alejandro',
    lastName: 'Ruiz',
    email: 'alejandro@ruiz.com',
    pets: ['pet10', 'pet11']
  },
  {
    id: '685b709c823da31e445fde6b',
    firstName: 'Agustín',
    lastName: 'López',
    email: 'agustin@lopez.com',
    pets: ['pet12', 'pet13', 'pet14']
  }
];

// Fechas para Julio-Agosto 2025
const getRandomDateInJuly = (startDay: number, endDay: number): Date => {
  const year = 2025;
  const month = 6; // Julio (0-indexed)
  const day = Math.floor(Math.random() * (endDay - startDay + 1)) + startDay;
  return new Date(year, month, day);
};

// Generar fechas de reserva
const generateReservationDates = () => {
  const startDate = getRandomDateInJuly(1, 31); // Entre 1 y 31 de julio
  const duration = Math.floor(Math.random() * 15) + 1; // 1-15 días (puede extenderse hasta agosto)
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);
  return { startDate, endDate };
};

// Calcular precio de la reserva
const calculateReservationPrice = async (caregiver: CaregiverData, careLocation: string, startDate: Date, endDate: Date, visitsPerDay?: number) => {
  const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let totalPrice = 0;
  let visitsCount = 0;

  if (careLocation === CARE_LOCATION.PET_HOME) {
    if (!caregiver.petHomeCare.visitPrice) {
      throw new Error(`Caregiver ${caregiver.firstName} no tiene precio configurado para pet_home`);
    }
    visitsCount = (visitsPerDay || 2) * daysCount;
    totalPrice = caregiver.petHomeCare.visitPrice * visitsCount;
  } else {
    if (!caregiver.homeCare.dayPrice) {
      throw new Error(`Caregiver ${caregiver.firstName} no tiene precio configurado para caregiver_home`);
    }
    totalPrice = caregiver.homeCare.dayPrice * daysCount;
  }

  // Validar que el precio sea válido
  if (isNaN(totalPrice) || totalPrice <= 0) {
    throw new Error(`Precio inválido calculado: ${totalPrice} para caregiver ${caregiver.firstName}`);
  }

  // Calculate commission using system configuration
  const { commission, totalOwner, totalCaregiver } = await calculateCommission(totalPrice);

  return {
    totalPrice,
    commission,
    totalOwner,
    totalCaregiver,
    visitsCount: careLocation === CARE_LOCATION.PET_HOME ? visitsCount : undefined
  };
};

// Generar comentarios de reseñas
const generateReviewComment = (rating: number): string => {
  const positiveComments = [
    'Excelente servicio, muy profesional y cariñoso con mi mascota',
    'Muy responsable y puntual, mi mascota quedó muy feliz',
    'Servicio de calidad, lo recomiendo totalmente',
    'Muy buena atención y cuidado, volvería a contratar',
    'Profesional y confiable, mi mascota se sintió cómoda'
  ];

  const neutralComments = [
    'Servicio correcto, cumplió con lo acordado',
    'Buen cuidado, aunque podría mejorar en algunos aspectos',
    'Aceptable, pero esperaba un poco más de atención',
    'Cumplió con lo básico, pero no destacó',
    'Servicio regular, funcionó para lo que necesitaba'
  ];

  const negativeComments = [
    'No cumplió con las expectativas, muy desorganizado',
    'Poco profesional, no lo recomiendo',
    'Servicio deficiente, mi mascota no estuvo cómoda',
    'Faltó responsabilidad y cuidado',
    'No volvería a contratar este servicio'
  ];

  if (rating >= 4) return positiveComments[Math.floor(Math.random() * positiveComments.length)];
  if (rating >= 3) return neutralComments[Math.floor(Math.random() * neutralComments.length)];
  return negativeComments[Math.floor(Math.random() * negativeComments.length)];
};

// Generar rating con distribución realista
const generateRating = (): number => {
  const rand = Math.random();
  if (rand < 0.6) return 5;      // 60% probabilidad de 5 estrellas
  if (rand < 0.8) return 4;      // 20% probabilidad de 4 estrellas
  if (rand < 0.9) return 3;      // 10% probabilidad de 3 estrellas
  if (rand < 0.95) return 2;     // 5% probabilidad de 2 estrellas
  return 1;                      // 5% probabilidad de 1 estrella
};

async function createReservations() {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB exitosamente');

    // Obtener mascotas reales de la base de datos (sin populate para evitar errores)
    const pets = await Pet.find({});
    console.log(`📊 Encontradas ${pets.length} mascotas en la BD`);

    // Obtener usuarios para mapear IDs
    const users = await User.find({}, 'firstName lastName email');
    const userMap = new Map(users.map((u: any) => [(u._id as any).toString(), u]));

    // Obtener tipos de mascota para mapear IDs
    const petTypes = await PetType.find({}, 'name');
    const petTypeMap = new Map(petTypes.map((pt: any) => [(pt._id as any).toString(), pt]));

    // Crear 15 reservas
    const reservations: any[] = [];
    let gonzaloAsOwner = 0;
    let gonzaloAsCaregiver = 0;

    for (let i = 0; i < 15; i++) {
      console.log(`\n📅 Creando reserva ${i + 1}/15...`);

      // Seleccionar owner y caregiver
      let owner: any;
      let caregiver: any;

      // Asegurar que Gonzalo participe en 4 reservas
      if (i < 4) {
        if (i < 2 && gonzaloAsOwner < 2) {
          // Gonzalo como owner
          owner = pets.find((p: any) => (p.owner as any).toString() === GONZALO_ID);
          caregiver = caregivers.find(c => c.id !== GONZALO_ID);
          gonzaloAsOwner++;
        } else if (gonzaloAsCaregiver < 2) {
          // Gonzalo como caregiver
          owner = pets.find((p: any) => (p.owner as any).toString() !== GONZALO_ID);
          caregiver = caregivers.find(c => c.id === GONZALO_ID);
          gonzaloAsCaregiver++;
        }
      } else {
        // Reservas normales
        owner = pets[Math.floor(Math.random() * pets.length)];
        caregiver = caregivers[Math.floor(Math.random() * caregivers.length)];
      }

      // Verificar que el caregiver acepte el tipo de mascota
      const petTypeId = (owner as any).petType.toString();
      const petTypeName = petTypeMap.get(petTypeId)?.name || 'Desconocido';
      if (!caregiver.petTypes.includes(petTypeId)) {
        console.log(`⚠️ Caregiver ${caregiver.firstName} no acepta ${petTypeName}, buscando otro...`);
        caregiver = caregivers.find(c => c.petTypes.includes(petTypeId));
        if (!caregiver) {
          console.log(`❌ No se encontró caregiver para ${petTypeName}, saltando...`);
          continue;
        }
      }

      // Generar fechas
      const { startDate, endDate } = generateReservationDates();
      
      // Determinar tipo de cuidado
      const careLocation = Math.random() > 0.5 ? CARE_LOCATION.PET_HOME : CARE_LOCATION.CAREGIVER_HOME;
      
      // Calcular precios
      const visitsPerDay = careLocation === CARE_LOCATION.PET_HOME ? Math.floor(Math.random() * 3) + 1 : undefined;
      let priceData;
      try {
        priceData = await calculateReservationPrice(caregiver, careLocation, startDate, endDate, visitsPerDay);
      } catch (error: any) {
        console.log(`❌ Error calculando precio: ${error.message}, saltando reserva...`);
        continue;
      }

      // Determinar estado basado en fechas
      let status: string = RESERVATION_STATUS.WAITING_ACCEPTANCE;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        // Reserva pasada
        if (Math.random() > 0.2) { // 80% probabilidad de ser aceptada
          status = RESERVATION_STATUS.FINISHED;
        } else {
          status = RESERVATION_STATUS.REJECTED;
        }
      } else if (startDate.getTime() === today.getTime()) {
        // Reserva que empieza hoy
        status = Math.random() > 0.3 ? RESERVATION_STATUS.STARTED : RESERVATION_STATUS.CONFIRMED;
      } else if (startDate < new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        // Reserva próxima (próxima semana)
        status = Math.random() > 0.2 ? RESERVATION_STATUS.CONFIRMED : RESERVATION_STATUS.WAITING_ACCEPTANCE;
      }

      // Crear reserva
      const reservation = new Reservation({
        startDate,
        endDate,
        careLocation,
        address: caregiver.careAddress,
        user: (owner as any).owner,
        caregiver: caregiver.id,
        pets: [(owner as any)._id],
        visitsCount: priceData.visitsCount,
        totalPrice: priceData.totalPrice,
        commission: priceData.commission,
        totalOwner: priceData.totalOwner,
        totalCaregiver: priceData.totalCaregiver,
        distance: Math.random() * 10 + 1, // 1-11 km
        status,
        createdAt: new Date(startDate.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Creada entre 1-30 días antes
        updatedAt: new Date()
      });

      await reservation.save();

      // Log de creación
      await logChanges(
        'Reservation',
        (reservation._id as any).toString(),
        'SYSTEM',
        'Simulation Script',
        [
          { field: 'status', oldValue: null, newValue: status },
          { field: 'careLocation', oldValue: null, newValue: careLocation },
          { field: 'totalPrice', oldValue: null, newValue: priceData.totalPrice }
        ]
      );

      const ownerUser = userMap.get((owner as any).owner.toString());
      const ownerName = ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName}` : 'Usuario Desconocido';
      console.log(`✅ Reserva creada: ${petTypeName} ${(owner as any).name} (${ownerName}) → ${caregiver.firstName} ${caregiver.lastName}`);
      console.log(`   Estado: ${status}, Fechas: ${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`);
      console.log(`   Tipo: ${careLocation}, Precio: $${priceData.totalPrice}`);

      reservations.push(reservation);

      // Crear reseñas para reservas finalizadas
      if (status === RESERVATION_STATUS.FINISHED) {
        // Reseña del owner al caregiver
        const ownerRating = generateRating();
        const ownerReview = new Review({
          reservation: (reservation._id as any),
          reviewer: (owner as any).owner,
          reviewedUser: caregiver.id,
          rating: ownerRating,
          comment: generateReviewComment(ownerRating),
          createdAt: new Date(endDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // 0-7 días después de finalizar
          updatedAt: new Date()
        });

        await ownerReview.save();

                  // Reseña del caregiver al owner (80% probabilidad)
          if (Math.random() > 0.2) {
            const caregiverRating = generateRating();
            const caregiverReview = new Review({
              reservation: (reservation._id as any),
              reviewer: caregiver.id,
              reviewedUser: (owner as any).owner,
            rating: caregiverRating,
            comment: generateReviewComment(caregiverRating),
            createdAt: new Date(endDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
          });

          await caregiverReview.save();
          console.log(`⭐ Reseñas creadas: Owner (${ownerRating}/5) y Caregiver (${caregiverRating}/5)`);
        } else {
          console.log(`⭐ Solo reseña del owner creada: ${ownerRating}/5`);
        }
      }
    }

    console.log('\n🎉 === SIMULACIÓN COMPLETADA ===');
    console.log(`✅ ${reservations.length} reservas creadas`);
    console.log(`✅ Gonzalo como owner: ${gonzaloAsOwner}`);
    console.log(`✅ Gonzalo como caregiver: ${gonzaloAsCaregiver}`);
    
    // Resumen de estados
    const statusCount = reservations.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, {} as any);
    
    console.log('\n📊 Estados de reservas:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Error durante la simulación:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

createReservations(); 