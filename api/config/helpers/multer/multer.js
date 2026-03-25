import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pathMulter = (path) => {
  return path;
};

// Ruta local en config/helpers/upload (sin subcarpeta img)
const resultMulter = (url) => {
  const uploadDir = path.join(__dirname, "..", url);
  // Crear la carpeta si no existe
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Extraer el prefijo del nombre de carpeta (ej: "user" o "article")
  const prefix = url.split("/").pop();

  const multerConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extension = file.originalname.split(".").pop();
      cb(null, `${prefix}-${uniqueSuffix}.${extension}`);
    },
  });

  return multerConfig;
};

export const upload = (url) =>
  multer({
    storage: resultMulter(`upload/${url}`),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      if (!allowedTypes.test(file.mimetype)) {
        cb(new Error("Solo se permiten imágenes"));
      } else {
        cb(null, true);
      }
    },
  });
