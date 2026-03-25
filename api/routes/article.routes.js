import {
  crearArticulo,
  obtenerArticulos,
  obtenerArticuloPorId,
  generarArticulo,
  actualizarArticulo,
  eliminarArticulo,
  obtenerArticulosPorUsuario,
  buscarArticulos,
  obtenerPosterArticulo,
  imageIaGenerateArticle,
  obtenerImagenIa,
  obtenerImagenesIa,
  obtenerArticulosAdmin,
  obtenerImagenesIaAdmin,
} from "../controllers/article.js";
import express from "express";
import { auth, adminAuth } from "../config/helpers/token/auth.js";
import { upload } from "../config/helpers/multer/multer.js";

const router = express.Router();

// Definir rutas

router.post("/", [auth, upload("article").single("image")], crearArticulo);
router.get("/", obtenerArticulos);
router.get("/admin/articles", [auth, adminAuth], obtenerArticulosAdmin);
router.get("/admin/ai-images", [auth, adminAuth], obtenerImagenesIaAdmin);

// ⚠️ Rutas estáticas SIEMPRE antes que las dinámicas (/:id)
router.get("/users/:userId/articles", obtenerArticulosPorUsuario);
router.post("/generate", generarArticulo);

// Rutas dinámicas
router.get("/search/:search", buscarArticulos);
router.get("/:id", obtenerArticuloPorId);
router.put(
  "/:id",
  [auth, upload("article").fields([{ name: "image", maxCount: 1 }])],
  actualizarArticulo,
);
router.delete("/:id", auth, eliminarArticulo);
router.get("/:id/poster", obtenerPosterArticulo);

router.post("/imagenIa", [auth], imageIaGenerateArticle);
router.get("/imagenIa/all", obtenerImagenesIa);
router.get("/imagenIa/:filename", obtenerImagenIa);

// Exportar rutas
export default router;
