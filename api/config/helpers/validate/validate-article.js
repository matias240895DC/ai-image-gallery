import validator from "validator";

// Campos permitidos para actualización parcial de artículos
export const allowedArticleFields = ["title", "content", "image"];

// ─── Validación de CREACIÓN (title y content obligatorios) ──────────────────

export const validate_article = (data) => {
  let errors = {};

  // Validar título (obligatorio)
  if (validator.isEmpty(data.title || "")) {
    errors.title = "El título es requerido";
  } else if (!validator.isLength(data.title, { min: 5, max: 100 })) {
    errors.title = "El título debe tener entre 5 y 100 caracteres";
  }

  // Validar contenido (obligatorio)
  if (validator.isEmpty(data.content || "")) {
    errors.content = "El contenido es requerido";
  } else if (!validator.isLength(data.content, { min: 20, max: 5000 })) {
    errors.content = "El contenido debe tener entre 20 y 5000 caracteres";
  }

  // Validar imagen (opcional)
  if (data.image !== undefined && !validator.isEmpty(data.image || "")) {
    const isURL = validator.isURL(data.image, { require_protocol: true });
    const hasValidExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(data.image);
    if (!isURL && !hasValidExtension) {
      errors.image =
        "La imagen debe ser una URL válida o un archivo (jpg, jpeg, png, gif, webp)";
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};

// ─── Validación de ACTUALIZACIÓN (solo valida campos presentes) ─────────────

export const validate_article_update = (data) => {
  let errors = {};

  // Validar título solo si se envía
  if (data.title !== undefined) {
    if (validator.isEmpty(data.title || "")) {
      errors.title = "El título no puede estar vacío";
    } else if (!validator.isLength(data.title, { min: 5, max: 100 })) {
      errors.title = "El título debe tener entre 5 y 100 caracteres";
    }
  }

  // Validar contenido solo si se envía
  if (data.content !== undefined) {
    if (validator.isEmpty(data.content || "")) {
      errors.content = "El contenido no puede estar vacío";
    } else if (!validator.isLength(data.content, { min: 20, max: 5000 })) {
      errors.content = "El contenido debe tener entre 20 y 5000 caracteres";
    }
  }

  // Validar imagen solo si se envía como string (URL o filename)
  if (data.image !== undefined && !validator.isEmpty(data.image || "")) {
    const isURL = validator.isURL(data.image, { require_protocol: true });
    const hasValidExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(data.image);
    if (!isURL && !hasValidExtension) {
      errors.image =
        "La imagen debe ser una URL válida o un archivo (jpg, jpeg, png, gif, webp)";
    }
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
};
