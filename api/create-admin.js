import mongoose from 'mongoose';
import 'dotenv/config';

// 1. Conectar a la base de datos
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/proyecto-backend';

async function createAdmin() {
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado a MongoDB');

    // 2. Buscar al usuario por email (podés cambiar el email aquí o pasarlo por argumento)
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Error: Debés proporcionar un email. Uso: node create-admin.js usuario@email.com');
      process.exit(1);
    }

    // Usamos el modelo directamente de la base de datos para no importar todo el proyecto si no es necesario
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String
    }), 'users');

    const result = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'superadmin' },
      { new: true }
    );

    if (result) {
      console.log(`🚀 ¡Éxito! El usuario ${email} ahora es SUPERADMIN.`);
    } else {
      console.log(`⚠️ No se encontró ningún usuario con el email: ${email}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();
