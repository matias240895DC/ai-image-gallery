import jwt from "jwt-simple";

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "Token de autenticación requerido" });
  }

  // Extraer token de "Bearer <token>"
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: "Token de autenticación inválido" });
  }

  try {
    const decoded = jwt.decode(token, process.env.SECRET_KEY_JWT);
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp <= now) {
      return res.status(401).json({ message: "Token expirado", code: "TOKEN_EXPIRED" });
    }
    if (decoded.tokenType && decoded.tokenType !== "access") {
      return res.status(401).json({ message: "Tipo de token inválido" });
    }
    req.user = decoded;
    console.log(`[AUTH] Usuario autenticado: ${decoded.email}`);
    next();
  } catch (error) {
    console.log(`[AUTH] Error decodificando token: ${error.message}`);
    return res.status(401).json({ message: "Token de autenticación inválido" });
  }
};

export const adminAuth = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    console.log(`[ADMIN-AUTH] Acceso concedido para: ${req.user.email}`);
    return next();
  }
  console.log(`[ADMIN-AUTH] Acceso denegado para: ${req.user?.email} (Rol: ${req.user?.role})`);
  return res.status(403).json({ message: "Acceso denegado: se requiere rol superadmin" });
};
