import validator from "validator";
import { allowedFields } from "../interface/interface.js";

export const validateFields = (data) => {
  let updateFields = {};

  // Solo actualizar campos que llegaron en la request
  for (let field of allowedFields) {
    if (data.hasOwnProperty(field)) {
      updateFields[field] = data[field];
    }
  }
  return updateFields;
};

// ─── Validaciones reutilizables por campo ───────────────────────────────────

const validateName = (value, errors) => {
  if (!value || value.trim() === "") return; // Opcional
  if (!validator.isLength(value, { min: 2, max: 30 })) {
    errors.name = "El nombre debe tener entre 2 y 30 caracteres";
  } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
    errors.name = "El nombre solo puede contener letras";
  }
};

const validateSurname = (value, errors) => {
  if (!value || value.trim() === "") return; // Opcional
  if (!validator.isLength(value, { min: 2, max: 30 })) {
    errors.surname = "El apellido debe tener entre 2 y 30 caracteres";
  } else if (!validator.isAlpha(value, "es-ES", { ignore: " " })) {
    errors.surname = "El apellido solo puede contener letras";
  }
};

const validateEmail = (value, errors) => {
  if (validator.isEmpty(value || "")) {
    errors.email = "El email es requerido";
  } else if (!validator.isEmail(value)) {
    errors.email = "El email no es válido";
  }
};

const validateNick = (value, errors) => {
  if (validator.isEmpty(value || "")) {
    errors.nick = "El nick es requerido";
  } else if (!validator.isLength(value, { min: 3, max: 20 })) {
    errors.nick = "El nick debe tener entre 3 y 20 caracteres";
  } else if (!validator.isAlphanumeric(value, "es-ES")) {
    errors.nick = "El nick solo puede contener letras y números, sin espacios";
  }
};

const validatePassword = (value, errors) => {
  if (validator.isEmpty(value || "")) {
    errors.password = "La contraseña es requerida";
  } else if (!validator.isLength(value, { min: 8 })) {
    errors.password = "La contraseña debe tener al menos 8 caracteres";
  }else if(!validator.isStrongPassword(value)){
    errors.password = "La contraseña debe tener al menos una mayuscula, una minuscula y un numero";
  }
};

// ─── Validación de REGISTRO (todos los campos obligatorios) ─────────────────

export const validateRegister = (data) => {
  let errors = {};

  validateName(data.name, errors);
  validateSurname(data.surname, errors);
  validateEmail(data.email, errors);
  validateNick(data.nick, errors);
  validatePassword(data.password, errors);

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

// ─── Validación de ACTUALIZACIÓN (solo campos presentes) ────────────────────

export const validate = (data) => {
  let errors = {};

  if (data.name !== undefined) validateName(data.name, errors);
  if (data.surname !== undefined) validateSurname(data.surname, errors);
  if (data.email !== undefined) validateEmail(data.email, errors);
  if (data.nick !== undefined) validateNick(data.nick, errors);
  if (data.password !== undefined) validatePassword(data.password, errors);

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
