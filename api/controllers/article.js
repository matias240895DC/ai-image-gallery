import {
  validate_article,
  validate_article_update,
  allowedArticleFields,
} from "../config/helpers/validate/validate-article.js";
import { article } from "../models/article.js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { HfInference } from "@huggingface/inference";
import sharp from "sharp";
import { securityLog } from "../models/securityLog.js";
import { forbiddenWords } from "../config/helpers/moderation/blacklist.js";
import { aiImage } from "../models/aiImage.js";

const getClientPublicIp = (req) => {
  const forwardedFor = req.headers["x-forwarded-for"];
  const rawIp = forwardedFor || req.ip || req.connection?.remoteAddress || "";
  const firstIp = String(rawIp).split(",")[0].trim();
  if (firstIp === "::1" || firstIp === "::ffff:127.0.0.1") {
    return "127.0.0.1";
  }
  return firstIp || "unknown";
};

const placeholderSvg = (label = "Imagen no disponible") => {
  const safe = String(label)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 42);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#0ea5e9" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="#0b1120"/>
  <rect width="1200" height="800" fill="url(#g)"/>
  <circle cx="250" cy="260" r="140" fill="#6366f1" filter="url(#blur)"/>
  <circle cx="900" cy="520" r="190" fill="#f43f5e" filter="url(#blur)"/>
  <rect x="90" y="520" width="1020" height="64" rx="18" fill="rgba(255,255,255,0.06)"/>
  <text x="600" y="566" font-family="Inter, Arial, sans-serif" font-size="26" fill="rgba(255,255,255,0.85)" text-anchor="middle">
    ${safe}
  </text>
</svg>`;
};

/**
 * @swagger
 * /api/articles:
 *   post:
 *     summary: Crear un nuevo artículo
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Artículo creado
 *       400:
 *         description: Datos inválidos
 */
export const crearArticulo = async (req, res) => {
  let body = req.body;

  if (!body.title || !body.content) {
    return res
      .status(400)
      .json({ message: "El título y el contenido son requeridos" });
  }

  try {
    const { errors, isValid } = validate_article(body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const userId = req.user.sub || req.user._id;
    const creatorIp = getClientPublicIp(req);
    const newArticle = new article({
      title: body.title,
      content: body.content,
      user: userId,
      image: req.file ? req.file.filename : "default.png",
      creatorIp,
    });

    await newArticle.save();

    return res.status(201).json({
      message: "Artículo guardado correctamente",
      article: newArticle,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el artículo" });
  }
};

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Obtener todos los artículos (paginado)
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de artículos
 */
export const obtenerArticulos = async (req, res) => {
  const { page = 1, limit = 10, q = "" } = req.query;

  try {
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: "user", select: "name surname nick" },
    };

    const result = await article.paginate(filter, options);

    return res.status(200).json({
      status: "success",
      articles: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener artículos" });
  }
};

/**
 * @swagger
 * /api/articles/{id}:
 *   get:
 *     summary: Obtener un artículo por ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del artículo
 *       404:
 *         description: Artículo no encontrado
 */
export const obtenerArticuloPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const foundArticle = await article
      .findById(id)
      .populate("user", "name surname");
    if (!foundArticle) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }
    return res.status(200).json({
      message: "Detalle del artículo obtenido correctamente",
      article: foundArticle,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el artículo" });
  }
};

// Generar artículo con IA
export const generarArticulo = async (req, res) => {
  return res.status(200).json({ message: "Artículo generado correctamente" });
};

/**
 * @swagger
 * /api/articles/{id}:
 *   patch:
 *     summary: Actualizar un artículo
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Artículo actualizado
 */
export const actualizarArticulo = async (req, res) => {
  const { id } = req.params;

  // 1. Filtrar solo campos permitidos
  let body = {};
  for (let field of allowedArticleFields) {
    if (req.body[field] !== undefined) {
      body[field] = req.body[field];
    }
  }

  // 2. Si viene imagen por Multer, usarla
  if (req.files && req.files.image && req.files.image[0]) {
    body.image = req.files.image[0].filename;
  }

  // 3. Validar que al menos llegó un campo
  if (Object.keys(body).length === 0) {
    return res
      .status(400)
      .json({ message: "No se enviaron campos para actualizar" });
  }

  try {
    // 4. Verificar que el artículo existe y pertenece al usuario autenticado
    const existingArticle = await article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    const userId = req.user.sub || req.user._id;

    if (
      !existingArticle.user ||
      existingArticle.user.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "No tenés permiso para editar este artículo" });
    }

    // 5. Validar los campos que llegan (no exige todos, solo los presentes)
    const { errors, isValid } = validate_article_update(body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    // 6. Actualizar y devolver el artículo actualizado
    const updatedArticle = await article.findByIdAndUpdate(id, body, {
      returnDocument: "after",
    });

    return res.status(200).json({
      message: "Artículo actualizado correctamente",
      article: updatedArticle,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el artículo" });
  }
};

/**
 * @swagger
 * /api/articles/{id}:
 *   delete:
 *     summary: Eliminar un artículo
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Artículo eliminado
 */
export const eliminarArticulo = async (req, res) => {
  const { id } = req.params;
  try {
    const existingArticle = await article.findById(id);
    if (!existingArticle) {
      return res.status(404).json({ message: "Artículo no encontrado" });
    }

    await article.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Artículo eliminado correctamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Error al eliminar el artículo" });
  }
};

/**
 * @swagger
 * /api/articles/user/{userId}:
 *   get:
 *     summary: Obtener artículos de un usuario específico
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de artículos del usuario
 */
export const obtenerArticulosPorUsuario = async (req, res) => {
  const { page = 1, limit = 10, q = "" } = req.query;
  const { userId } = req.params;

  try {
    const filter = { user: userId };
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const result = await article.paginate(filter, options);

    return res.status(200).json({
      status: "success",
      articles: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener artículos" });
  }
};

/**
 * @swagger
 * /api/articles/search/{search}:
 *   get:
 *     summary: Buscar artículos por título o contenido
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 */
export const buscarArticulos = async (req, res) => {
  try {
    const searchString = req.params.search;

    // Validar que se envió el parámetro
    if (!searchString || searchString.trim() === "") {
      return res
        .status(400)
        .json({ message: "El parámetro de búsqueda 'q' es requerido" });
    }

    const articlesSearch = await article
      .find({
        $or: [
          { title: { $regex: searchString.trim(), $options: "i" } },
          { content: { $regex: searchString.trim(), $options: "i" } },
        ],
      })
      .populate("user", "name surname")
      .sort({ createdAt: -1 });

    if (articlesSearch.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron artículos", articles: [] });
    }
    return res.status(200).json({
      message: "Búsqueda de artículos realizada correctamente",
      articles: articlesSearch,
    });
  } catch (error) {
    console.error("Error en buscarArticulos:", error);
    return res
      .status(500)
      .json({ message: error.message || "Error al buscar artículos" });
  }
};

export const uploadImagenArticulo = async (req, res) => {
  console.log(req.user);
  //recoger el id del usuario
  let id = req.user.sub;

  //recojer el fichero y comprobar que existe avatar del usuario

  if (!req.file) {
    return res.status(409).json({ message: "No se ha subido ningún avatar" });
  }

  try {
    const { filename, path: filePath } = req.file;

    const ext = filePath.split(".").pop().toLowerCase();

    const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
    if (!allowedExtensions.includes(ext)) {
      fs.unlinkSync(filePath);
      return res.status(409).json({ message: "Archivo no permitido" });
    }

    let search_id = article.findOne({ user: id }).exec();
    if (!search_id) {
      return res
        .status(404)
        .json({ message: "No se encontró artículos del usuario" });
    }

    await user
      .updateOne(
        { _id: id },
        {
          avatar: filename,
        },
      )
      .exec();

    res.status(200).json({
      message: "Avatar subido y actualizado correctamente",
      debug: {
        filename,
        path: filePath,
        exists: fs.existsSync(filePath),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const obtenerPosterArticulo = async (req, res) => {
  try {
    const id = req.params.id;
    const articleData = await article.findOne({ _id: id }).exec();

    if (!articleData || !articleData.image) {
      return res
        .status(404)
        .json({ message: "Artículo o imagen no encontrado" });
    }

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Misma ruta donde multer guarda
    const uploadDir = path.join(__dirname, "../config/helpers/upload/article");
    const avatarPath = path.join(uploadDir, articleData.image);

    if (!fs.existsSync(avatarPath)) {
      // Placeholder autoconenido si no existe el archivo local
      return res.status(200).type("image/svg+xml").send(placeholderSvg(articleData?.title || "Imagen no disponible"));
    }

    return res.sendFile(avatarPath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/articles/imagenIa:
 *   post:
 *     summary: Generar imagen con IA
 *     tags: [Articles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Imagen generada
 *       400:
 *         description: Prompt requerido o inapropiado
 *       500:
 *         description: Error en el servidor
 */
export const imageIaGenerateArticle = async (req, res) => {
  const inference = new HfInference(process.env.HF_API_KEY);

  try {
    const { prompt } = req.body;
    const ip = getClientPublicIp(req);
    const userId = req.user.sub || req.user._id;

    if (!prompt) {
      return res
        .status(400)
        .json({ message: "El parámetro 'prompt' es requerido" });
    }

    // 1. Moderación Local (Blacklist) - Rápida y Gratuita
    const promptLower = prompt.toLowerCase();
    const hasForbiddenWord = forbiddenWords.some((word) =>
      promptLower.includes(word.toLowerCase()),
    );

    if (hasForbiddenWord) {
      await securityLog.create({
        user: userId,
        ip,
        prompt,
        status: "denied",
        reason: "Content blocked by local blacklist",
      });
      return res.status(400).json({
        message: "El contenido contiene palabras no permitidas.",
      });
    }

    // 2. Moderación con Hugging Face (Gratis con HF_API_KEY)
    const moderationResult = await inference.textClassification({
      model: "facebook/roberta-hate-speech-dynabench-r4-target",
      inputs: prompt,
    });

    // El modelo devuelve [{label: 'hate', score: 0.9}, {label: 'nothate', score: 0.1}]
    const hateScore =
      moderationResult.find((res) => res.label === "hate")?.score || 0;

    if (hateScore > 0.5) {
      // Umbral de 0.5 para detectar odio
      await securityLog.create({
        user: userId,
        ip,
        prompt,
        status: "denied",
        reason: `Content flagged by AI moderation (Score: ${hateScore})`,
      });

      return res.status(400).json({
        message: "El contenido ha sido detectado como inapropiado por la IA.",
      });
    }

    // Registrar intento permitido
    await securityLog.create({
      user: userId,
      ip,
      prompt,
      status: "allowed",
    });

    // 3. Generación de imagen
    console.log(`[IA] Solicitando imagen para: "${prompt}"...`);

    // Timeout de seguridad de 60 segundos
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout en la generación de IA")), 60000),
    );

    const imagePromise = inference.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
    });

    const image = await Promise.race([imagePromise, timeout]);
    console.log(`[IA] Imagen recibida de Hugging Face`);

    const buffer = Buffer.from(await image.arrayBuffer());
    console.log(`[IA] Optimizando imagen con Sharp...`);
    const optimizedImage = await sharp(buffer)
      .resize(512)
      .jpeg({ quality: 70 })
      .toBuffer();

    // 4. Guardar imagen en el servidor para la Galería IA
    const filename = `ai-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const aiUploadDir = path.join(__dirname, "../config/helpers/upload/ai");
    
    if (!fs.existsSync(aiUploadDir)) {
      fs.mkdirSync(aiUploadDir, { recursive: true });
    }
    
    const aiPath = path.join(aiUploadDir, filename);
    fs.writeFileSync(aiPath, optimizedImage);

    // Guardar registro en DB
    await aiImage.create({
      prompt,
      filename,
      user: userId,
      creatorIp: ip,
    });

    console.log(`[IA] Envío de imagen completado y guardado con éxito`);
    res.set("Content-Type", "image/jpeg");
    return res.send(optimizedImage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al generar imagen" });
  }
};

export const obtenerImagenIa = async (req, res) => {
  try {
    const filename = req.params.filename;
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const aiUploadDir = path.join(__dirname, "../config/helpers/upload/ai");
    const aiPath = path.join(aiUploadDir, filename);

    if (!fs.existsSync(aiPath)) {
      // Placeholder autoconenido si no existe el archivo local.
      return res.status(200).type("image/svg+xml").send(placeholderSvg(filename));
    }

    return res.sendFile(aiPath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const obtenerImagenesIa = async (req, res) => {
  const { page = 1, limit = 12, q = "" } = req.query;

  try {
    const filter = q ? { prompt: { $regex: q, $options: "i" } } : {};
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
    };

    const result = await aiImage.paginate(filter, options);
    return res.status(200).json({
      status: "success",
      images: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const obtenerArticulosAdmin = async (req, res) => {
  const { page = 1, limit = 10, q = "" } = req.query;

  try {
    const filter = q
      ? {
          $or: [
            { title: { $regex: q, $options: "i" } },
            { content: { $regex: q, $options: "i" } },
            { creatorIp: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: "user", select: "name nick email" },
    };

    const result = await article.paginate(filter, options);
    return res.status(200).json({
      status: "success",
      articles: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener artículos admin" });
  }
};

export const obtenerImagenesIaAdmin = async (req, res) => {
  const { page = 1, limit = 10, q = "" } = req.query;

  try {
    const filter = q
      ? {
          $or: [
            { prompt: { $regex: q, $options: "i" } },
            { creatorIp: { $regex: q, $options: "i" } },
          ],
        }
      : {};

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 },
      populate: { path: "user", select: "name nick email" },
    };

    const result = await aiImage.paginate(filter, options);
    return res.status(200).json({
      status: "success",
      images: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener imágenes IA admin" });
  }
};
