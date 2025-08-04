import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Reservation from '../src/models/Reservation';
import User from '../src/models/User';
import { RESERVATION_STATUS } from '../src/types';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || '';

async function testPaymentSystem() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Find a user and caregiver for testing
    const user = await User.findOne({ role: 'user' });
    const caregiver = await User.findOne({ role: 'caregiver' });

    if (!user || !caregiver) {
      console.log('❌ No se encontraron usuarios para la prueba');
      return;
    }

    console.log(`👤 Usuario de prueba: ${user.firstName} ${user.lastName}`);
    console.log(`👨‍⚕️ Cuidador de prueba: ${caregiver.firstName} ${caregiver.lastName}`);

    // Create a test reservation with payment_pending status
    const testReservation = new Reservation({
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      careLocation: 'pet_home',
      address: {
        name: 'Casa del Usuario',
        fullAddress: 'Av. Test 123, Buenos Aires',
        coords: {
          lat: -34.6037,
          lon: -58.3816
        }
      },
      user: user._id,
      caregiver: caregiver._id,
      pets: [], // You can add pet IDs here if needed
      visitsCount: 3,
      totalPrice: 150.00,
      commission: 9.00,
      totalOwner: 159.00,
      totalCaregiver: 141.00,
      status: RESERVATION_STATUS.PAYMENT_PENDING
    });

    await testReservation.save();
    console.log(`✅ Reserva de prueba creada con ID: ${testReservation._id}`);
    console.log(`💰 Precio total: $${testReservation.totalPrice}`);
    console.log(`📊 Estado: ${testReservation.status}`);

    // Test payment intent creation (simulation)
    console.log('\n💳 Simulando creación de Payment Intent...');
    console.log(`📋 Reservation ID: ${testReservation._id}`);
    console.log(`💰 Amount: $${testReservation.totalPrice}`);
    console.log(`💱 Currency: USD`);

    // Simulate successful payment
    console.log('\n✅ Simulando pago exitoso...');
    testReservation.status = RESERVATION_STATUS.WAITING_ACCEPTANCE;
    await testReservation.save();
    console.log(`✅ Pago exitoso, esperando aceptación del cuidador`);

    // Test failed payment
    console.log('\n❌ Simulando pago fallido...');
    const failedReservation = new Reservation({
      ...testReservation.toObject(),
      _id: undefined,
      status: RESERVATION_STATUS.PAYMENT_PENDING
    });
    await failedReservation.save();
    
    failedReservation.status = RESERVATION_STATUS.PAYMENT_REJECTED;
    await failedReservation.save();
    console.log(`❌ Reserva rechazada por pago fallido`);

    console.log('\n🎉 Pruebas del sistema de pagos completadas');
    console.log('\n📊 Resumen:');
    console.log(`- Reserva exitosa: ${testReservation._id}`);
    console.log(`- Reserva fallida: ${failedReservation._id}`);
    console.log(`- Estados probados: ${RESERVATION_STATUS.PAYMENT_PENDING}, ${RESERVATION_STATUS.WAITING_ACCEPTANCE}, ${RESERVATION_STATUS.PAYMENT_REJECTED}`);

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Run the test
testPaymentSystem(); 