import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';
import Pet from '../src/models/Pet';
import PetType from '../src/models/PetType';
import Reservation from '../src/models/Reservation';
import Review from '../src/models/Review';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://gonzalosanchez:QT4KAbuD8thKzY0n@cluster0.tjtxlku.mongodb.net/tfi-sanchezpalomino';

async function getDatabaseData() {
  try {
    console.log('🚀 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB exitosamente');

    console.log('\n📊 === DATOS DE LA BASE DE DATOS ===\n');

    // 1. Obtener tipos de mascota
    console.log('🐕 === TIPOS DE MASCOTA ===');
    const petTypes = await PetType.find({}, 'name');
    console.log('Tipos disponibles:', petTypes.map(pt => ({ id: pt._id, name: pt.name })));

    // 2. Obtener usuarios con configuración de cuidado
    console.log('\n👥 === USUARIOS CON CONFIGURACIÓN DE CUIDADO ===');
    const caregivers = await User.find({
      $or: [
        { 'carerConfig.homeCare.enabled': true },
        { 'carerConfig.petHomeCare.enabled': true }
      ]
    }).populate('carerConfig.petTypes', 'name');

    console.log(`\nEncontrados ${caregivers.length} cuidadores:`);
    caregivers.forEach(caregiver => {
      console.log(`\n- ${caregiver.firstName} ${caregiver.lastName} (${caregiver.email})`);
      console.log(`  ID: ${caregiver._id}`);
      console.log(`  HomeCare: ${caregiver.carerConfig?.homeCare?.enabled ? `$${caregiver.carerConfig.homeCare.dayPrice}/día` : 'Deshabilitado'}`);
      console.log(`  PetHomeCare: ${caregiver.carerConfig?.petHomeCare?.enabled ? `$${caregiver.carerConfig.petHomeCare.visitPrice}/visita` : 'Deshabilitado'}`);
      console.log(`  Tipos aceptados: ${caregiver.carerConfig?.petTypes?.map((pt: any) => pt.name).join(', ') || 'Ninguno'}`);
      console.log(`  Direcciones: ${caregiver.addresses?.length || 0}`);
      console.log(`  CareAddress: ${caregiver.carerConfig?.careAddress || 'No configurada'}`);
    });

    // 3. Obtener usuarios con mascotas (potenciales owners)
    console.log('\n🐾 === USUARIOS CON MASCOTAS ===');
    const owners = await User.aggregate([
      {
        $lookup: {
          from: 'pets',
          localField: '_id',
          foreignField: 'owner',
          as: 'pets'
        }
      },
      {
        $match: {
          'pets.0': { $exists: true }
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          petsCount: { $size: '$pets' },
          pets: 1
        }
      }
    ]);

    console.log(`\nEncontrados ${owners.length} usuarios con mascotas:`);
    owners.forEach((owner: any) => {
      console.log(`\n- ${owner.firstName} ${owner.lastName} (${owner.email})`);
      console.log(`  ID: ${owner._id}`);
      console.log(`  Mascotas: ${owner.petsCount}`);
    });

    // 4. Obtener mascotas con detalles
    console.log('\n🐕 === MASCOTAS ===');
    const pets = await Pet.find({})
      .populate('owner', 'firstName lastName email')
      .populate('petType', 'name')
      .populate('characteristics.characteristic', 'name');

    console.log(`\nEncontradas ${pets.length} mascotas:`);
    pets.forEach(pet => {
      console.log(`\n- ${pet.name} (${(pet.petType as any)?.name})`);
      console.log(`  ID: ${pet._id}`);
      console.log(`  Owner: ${(pet.owner as any)?.firstName} ${(pet.owner as any)?.lastName} (${(pet.owner as any)?.email})`);
      console.log(`  Owner ID: ${(pet.owner as any)?._id}`);
      console.log(`  Características: ${pet.characteristics?.map((c: any) => `${(c.characteristic as any)?.name}: ${c.value}`).join(', ') || 'Ninguna'}`);
    });

    // 5. Obtener reservas existentes
    console.log('\n📅 === RESERVAS EXISTENTES ===');
    const existingReservations = await Reservation.find({})
      .populate('user', 'firstName lastName email')
      .populate('caregiver', 'firstName lastName email')
      .populate('pets', 'name');

    console.log(`\nEncontradas ${existingReservations.length} reservas existentes:`);
    existingReservations.forEach(reservation => {
      console.log(`\n- Reserva ${reservation._id}`);
      console.log(`  Owner: ${(reservation.user as any)?.firstName} ${(reservation.user as any)?.lastName}`);
      console.log(`  Caregiver: ${(reservation.caregiver as any)?.firstName} ${(reservation.caregiver as any)?.lastName}`);
      console.log(`  Estado: ${reservation.status}`);
      console.log(`  Fechas: ${reservation.startDate.toISOString().split('T')[0]} - ${reservation.endDate.toISOString().split('T')[0]}`);
      console.log(`  Tipo: ${reservation.careLocation}`);
      console.log(`  Mascotas: ${reservation.pets?.map((p: any) => p.name).join(', ')}`);
    });

    // 6. Obtener reseñas existentes
    console.log('\n⭐ === RESEÑAS EXISTENTES ===');
    const existingReviews = await Review.find({})
      .populate('reviewer', 'firstName lastName email')
      .populate('reviewedUser', 'firstName lastName email')
      .populate('reservation', 'startDate endDate');

    console.log(`\nEncontradas ${existingReviews.length} reseñas existentes:`);
    existingReviews.forEach(review => {
      console.log(`\n- Reseña ${review._id}`);
      console.log(`  Revisor: ${(review.reviewer as any)?.firstName} ${(review.reviewer as any)?.lastName}`);
      console.log(`  Evaluado: ${(review.reviewedUser as any)?.firstName} ${(review.reviewedUser as any)?.lastName}`);
      console.log(`  Rating: ${review.rating}/5`);
      console.log(`  Comentario: ${review.comment || 'Sin comentario'}`);
    });

    console.log('\n✅ === FIN DE LA CONSULTA ===\n');

  } catch (error) {
    console.error('❌ Error durante la consulta:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

getDatabaseData(); 