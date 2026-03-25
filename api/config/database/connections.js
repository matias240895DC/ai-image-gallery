import "dotenv/config";
import moongoose from "mongoose";

export const conectarDB = async () => {
  try {
    await moongoose.connect(process.env.MONGO_URI);
    console.log("Base de datos conectada");
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    process.exit(1); // Salir del proceso con un código de error
  }
};
