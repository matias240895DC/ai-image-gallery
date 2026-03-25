import path from "path";
import jwt from "jwt-simple";
import {
  createAccessToken,
  createRefreshToken,
} from "../config/helpers/token/jwt.js";
import {
  validate,
  validateRegister,
  validateFields,
} from "../config/helpers/validate/validate-users.js";
import { user } from "../models/user.js";
import { securityLog } from "../models/securityLog.js";
import bcrypt from "bcryptjs";
import fs from "fs";
import { fileURLToPath } from "url";

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: string
 *               surname: string
 *               nick: string
 *               email: string
 *               password: string
 *     responses:
 *       201:
 *         description: Usuario registrado
 */
export const registrarUsuario = async (req, res) => {
  let body = req.body;
  const { errors, isValid } = validateRegister(body);
  if (!isValid) return res.status(409).json(errors);
  
  try {
    if (body.email) body.email = body.email.toLowerCase();
    if (body.nick) body.nick = body.nick.toLowerCase();

    const userEmailExits = await user.findOne({ email: body.email });
    if (userEmailExits) return res.status(409).json({ message: "El correo electrónico ya está registrado" });

    const userNickExists = await user.findOne({ nick: body.nick });
    if (userNickExists) return res.status(409).json({ message: "El nombre de usuario (nick) ya está en uso" });

    body.password = await bcrypt.hash(body.password, 10);
    await user.create(body);
    return res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Users]
 */
export const loginUsuario = async (req, res) => {
  let { email, password } = req.body;
  if (!email || !password) return res.status(409).json({ message: "Email y contraseña son requeridos" });

  try {
    const userToLogin = await user.findOne({ email: email.toLowerCase() });
    if (!userToLogin) return res.status(409).json({ message: "El usuario no existe" });

    if (userToLogin.status === "inactive") {
      return res.status(403).json({ message: "Tu cuenta ha sido desactivada por un administrador." });
    }

    const comparePassword = await bcrypt.compare(password, userToLogin.password);
    if (!comparePassword) return res.status(409).json({ message: "Contraseña incorrecta" });

    const accessToken = createAccessToken(userToLogin);
    const refreshToken = createRefreshToken(userToLogin);
    const decodedRefresh = jwt.decode(refreshToken, process.env.SECRET_KEY_JWT);

    userToLogin.refreshToken = refreshToken;
    userToLogin.refreshTokenExpiresAt = new Date(decodedRefresh.exp * 1000);
    await userToLogin.save();

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: userToLogin._id,
        name: userToLogin.name,
        surname: userToLogin.surname,
        role: userToLogin.role,
      },
      token: accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error en login" });
  }
};

export const refreshTokenUsuario = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token requerido" });
  }

  try {
    const decoded = jwt.decode(refreshToken, process.env.SECRET_KEY_JWT);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.tokenType !== "refresh" || decoded.exp <= now) {
      return res.status(401).json({ message: "Refresh token expirado o inválido" });
    }

    const currentUser = await user.findById(decoded.sub);
    if (!currentUser || currentUser.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Refresh token inválido" });
    }

    if (
      currentUser.refreshTokenExpiresAt &&
      new Date(currentUser.refreshTokenExpiresAt).getTime() <= Date.now()
    ) {
      return res.status(401).json({ message: "Refresh token vencido" });
    }

    const newAccessToken = createAccessToken(currentUser);
    const newRefreshToken = createRefreshToken(currentUser);
    const decodedNewRefresh = jwt.decode(newRefreshToken, process.env.SECRET_KEY_JWT);

    currentUser.refreshToken = newRefreshToken;
    currentUser.refreshTokenExpiresAt = new Date(decodedNewRefresh.exp * 1000);
    await currentUser.save();

    return res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(401).json({ message: "Refresh token inválido" });
  }
};

export const obtenerPerfilUsuario = async (req, res) => {
  try {
    const result = await user.findById(req.params.id).select("-password");
    return res.status(200).json({ user: result });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener perfil" });
  }
};

export const actualizarPerfilUsuario = async (req, res) => {
  try {
    const id = req.params.id;
    let update_body = validateFields(req.body);
    if (update_body.password) update_body.password = await bcrypt.hash(update_body.password, 10);
    
    await user.findByIdAndUpdate(id, update_body);
    return res.status(200).json({ message: "Perfil actualizado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar perfil" });
  }
};

export const avatar = async (req, res) => {
  if (!req.file) return res.status(409).json({ message: "No se ha subido ningún avatar" });
  try {
    const { filename } = req.file;
    await user.findByIdAndUpdate(req.user.sub, { avatar: filename });
    return res.status(200).json({ message: "Avatar actualizado", filename });
  } catch (error) {
    return res.status(500).json({ message: "Error al subir avatar" });
  }
};

export const obtenerAvatar = async (req, res) => {
  try {
    const userData = await user.findById(req.params.id);
    if (!userData || !userData.avatar) return res.status(404).json({ message: "Avatar no encontrado" });
    
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const avatarPath = path.join(__dirname, "../config/helpers/upload/user", userData.avatar);
    
    if (!fs.existsSync(avatarPath)) return res.status(404).json({ message: "Archivo no encontrado" });
    return res.sendFile(avatarPath);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener avatar" });
  }
};

export const soloUsuariosAutenticados = (req, res) => {
  return res.status(200).json({ message: "Acceso permitido" });
};

// ─── ADMIN CONTROLLERS ────────────────────────────────────────────────────────

export const obtenerUsuariosAdmin = async (req, res) => {
  console.log("[OBTENER-USUARIOS-ADMIN] Inicio...");
  const { page = 1, limit = 10, q = "" } = req.query;

  try {
    const filter = q ? {
      $or: [
        { name: { $regex: q, $options: "i" } },
        { nick: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    } : {};

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      select: "-password",
    };

    const result = await user.paginate(filter, options);
    return res.status(200).json({
      status: "success",
      users: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const obtenerLogsAdmin = async (req, res) => {
  console.log("[OBTENER-LOGS-ADMIN] Inicio...");
  const { page = 1, limit = 10, q = "", status = "" } = req.query;

  try {
    let filter = {};
    const normalizedStatus = String(status || "").toLowerCase().trim();

    // Permite filtrar por estados reales en DB: allowed / denied.
    if (normalizedStatus === "allowed" || normalizedStatus === "denied") {
      filter.status = normalizedStatus;
    }

    if (q) {
      const matchingUsers = await user.find({
        $or: [
          { nick: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
          { name: { $regex: q, $options: "i" } },
        ],
      }).select("_id");
      
      const userIds = matchingUsers.map((u) => u._id);
      const searchFilter = {
        $or: [
          { prompt: { $regex: q, $options: "i" } },
          { ip: { $regex: q, $options: "i" } },
          { user: { $in: userIds } },
        ],
      };

      filter = {
        ...filter,
        ...searchFilter,
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: "user", select: "name nick email" },
    };

    const result = await securityLog.paginate(filter, options);
    return res.status(200).json({
      status: "success",
      logs: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener logs" });
  }
};

export const cambiarRolUsuario = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["user", "superadmin"].includes(role)) return res.status(400).json({ message: "Rol inválido" });

  try {
    const updated = await user.findByIdAndUpdate(id, { role }, { new: true }).select("-password");
    if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.status(200).json({ message: "Rol actualizado", user: updated });
  } catch (error) {
    return res.status(500).json({ message: "Error al cambiar rol" });
  }
};

export const cambiarEstadoUsuario = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!["active", "inactive"].includes(status)) return res.status(400).json({ message: "Estado inválido" });

  try {
    if (req.user.sub === id && status === "inactive") {
      return res.status(400).json({ message: "No puedes desactivarte a ti mismo" });
    }
    const updated = await user.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: "Usuario no encontrado" });
    return res.status(200).json({ message: "Estado actualizado", user: { id: updated._id, status: updated.status } });
  } catch (error) {
    return res.status(500).json({ message: "Error al cambiar estado" });
  }
};
