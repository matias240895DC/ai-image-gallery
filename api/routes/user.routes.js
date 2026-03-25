// importaciones

import express from "express";
import {
  actualizarPerfilUsuario,
  avatar,
  loginUsuario,
  obtenerAvatar,
  obtenerPerfilUsuario,
  registrarUsuario,
  soloUsuariosAutenticados,
  obtenerUsuariosAdmin,
  obtenerLogsAdmin,
  cambiarRolUsuario,
  cambiarEstadoUsuario,
  refreshTokenUsuario,
} from "../controllers/user.js";
import { auth, adminAuth } from "../config/helpers/token/auth.js";
import { upload } from "../config/helpers/multer/multer.js";

const router = express.Router();

// Definir rutas

router.post("/register", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/refresh-token", refreshTokenUsuario);
router.get("/profile/:id", obtenerPerfilUsuario);
router.patch("/profile/:id", auth, actualizarPerfilUsuario);
router.patch("/avatar/:id", [auth, upload("user").single("avatar")], avatar);
router.get("/usuario/avatar/:id", auth, obtenerAvatar);
router.get("/private", auth, soloUsuariosAutenticados);

// Rutas de Super Admin
router.get("/admin/users", [auth, adminAuth], obtenerUsuariosAdmin);
router.get("/admin/logs", [auth, adminAuth], obtenerLogsAdmin);
router.patch("/admin/role/:id", [auth, adminAuth], cambiarRolUsuario);
router.patch("/admin/status/:id", [auth, adminAuth], cambiarEstadoUsuario);

// Exportar rutas
export default router;
