// Importart dependencias
import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { conectarDB } from "./config/database/connections.js";
import userRoutes from "./routes/user.routes.js";
import articleRoutes from "./routes/article.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// crear servidor de node
const app = express();
app.set("trust proxy", true);

// convertir los datos a json
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conectar a la base de datos
await conectarDB();

// Configuración de Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Proyecto Portafolio - Proyecto-1",
      version: "1.0.0",
      description:
        "Documentación de la API para el sistema de artículos y usuarios con IA.",
      contact: {
        name: "Matias Marcelo Dei Castelli",
      },
    },
    servers: [
      {
        url: "http://localhost:4009",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Rutas a los archivos con anotaciones
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// configurar las rutas

app.use("/api/users", userRoutes);

app.use("/api/articles", articleRoutes);

// poner en marcha el serivdor a escuchar peticiones
const PORT = process.env.PORT || 4009;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
