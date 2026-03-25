import jwt from "jwt-simple";

const ACCESS_TOKEN_TTL_SECONDS = 60 * 15; // 15 minutos
const REFRESH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 días

export const createAccessToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user._id,
    name: user.name,
    nick: user.nick,
    email: user.email,
    role: user.role,
    tokenType: "access",
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  };
  const token = jwt.encode(payload, process.env.SECRET_KEY_JWT);
  return token;
};

export const createRefreshToken = (user) => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: user._id,
    tokenType: "refresh",
    iat: now,
    exp: now + REFRESH_TOKEN_TTL_SECONDS,
  };
  return jwt.encode(payload, process.env.SECRET_KEY_JWT);
};

// Mantener compatibilidad con el código existente.
export const createToken = createAccessToken;
