# Galería de imagenes con IA - Plataforma Full Stack con IA

¡Bienvenido a **Proyecto-1**! Esta es una plataforma web completa desarrollada con el stack **MEAN/MERN** (usando Angular en el frontend) orientada a la creación de artículos y generación de imágenes mediante Inteligencia Artificial.

Este proyecto abarca desde una sólida **API REST** construida con Node.js, Express y MongoDB, hasta un dinámico **Frontend SPA** estructurado en Angular 21, ofreciendo funcionalidades como autenticación de usuarios, panel de administración interactivo, carga y procesamiento de imágenes, y una integración directa con modelos de **Hugging Face** para la generación de imágenes IA.

---

## 🚀 Características Principales

### 🔐 Autenticación y Seguridad
- **Registro y Login seguro:** Contraseñas encriptadas mediante `bcryptjs`.
- **Sistema de Tokens JWT:**
  - `Access Token` para la autenticación en cada petición a la API.
  - `Refresh Token` para mantener la sesión activa sin obligar al usuario a iniciar sesión repetidamente tras la expiración del Access Token.
- **Roles de Usuario:** Diferenciación entre usuarios estándar (`user`) y super administradores (`superadmin`).
- **Estados de Cuenta:** Cuentas con estados `active` e `inactive` (útil para baneos temporales o desactivación de cuentas desde el Panel Admin).
- **Rastreo de Seguridad IP:** Registro de la dirección IP responsable de la creación de cada artículo e imagen IA.

### 📝 Gestión de Artículos
- **CRUD completo** (Crear, Leer, Actualizar, Eliminar) para todos los artículos que los usuarios publican.
- **Subida de Imágenes:** Inclusión de imágenes de portada en formato `.jpg`, `.jpeg`, `.png`, o `.gif` procesadas en el backend con `multer`.
- **Galería interactiva:** Un listado en tiempo real de los artículos creados en la plataforma.
- **Búsqueda Avanzada y Paginación:** El backend gestiona de forma nativa la paginación con `mongoose-paginate-v2` para no saturar al cliente en grandes colecciones.

### 🤖 Generación de Imágenes mediante IA
- Integración completa con **Hugging Face `inference` SDK**.
- Utilice modelos como **Stable Diffusion XL** (`stabilityai/stable-diffusion-xl-base-1.0`) para generar recursos visuales mediante texto (*prompts*).
- **Moderación Activa Anti-Odio (Moderation/Blacklist):** Antes de consumir los créditos en la API de HuggingFace, se revisa el prompt con:
  - Una lista negra local de palabras prohibidas (`forbiddenWords`).
  - Una evaluación de sentimiento/odio provista por el modelo `facebook/roberta-hate-speech-dynabench-r4-target`.
- En caso de detectar contenido inapropiado, se registra en un modelo de **Security Logs**.

### 💼 Panel de Administración
Un usuario con el rol `superadmin` dispone de las siguientes capacidades:
- Listar todos los artículos, imágenes generadas e interacciones (paginados), permitiendo un rastreo exhaustivo.
- Obtener un listado de todos los usuarios registrados en el sistema.
- Cambiar el rol (`user` <-> `superadmin`) de cualquier integrante de la plataforma (exceptuando al propio admin que esté online, no puede cambiarse el rol a sí mismo o darse de baja para evitar bloqueos).
- Revisar y filtrar el registro de intentos de generación IA (Security Logs), viendo qué peticiones fueron `allowed` (permitidas) o `denied` (bloqueadas).

---

## 🏗️ Arquitectura y Estructura del Proyecto

El código está limpiamente separado en dos directorios principales: **`api`** (Backend backend) y **`frontend`** (Cliente Web en el navegador).

### Backend (`/api`)
Desarrollado en **Node.js (v18+)** + **Express** usando sintaxis moderna ES Modules (`import/export` nativo).

La estructura de carpetas abarca:
- `index.js`: Archivo principal o entry point. Monta middlewares, configuración estática y documentación. Inicia las librerías `cors`, parseo de `json` y se enlaza a MongoDB.
- `models/`: Esquemas de Mongoose para las colecciones de la BBDD (Mongoose ODM). Modelos: `User`, `Article`, `AiImage`, `SecurityLog`.
- `controllers/`: El *lógica de negocio* principal. 
  - `user.js`: Controladores para registro, login, refresh, panel admin, act. avatar, roles...
  - `article.js`: Controladores para el CRUD, validación manual e integración IA (`imageIaGenerateArticle`, que a su vez se encarga de usar `sharp` para redimensionar las imágenes IA).
- `routes/`: Definición de endpoints y agrupamiento de rutas (`user.routes.js`, `article.routes.js`), aplicación de middlewares de autenticación (`auth`, `adminAuth`).
- `config/`: Funciones helper o de utilidad general:
  - `database/`: Cadenas de conexión a MongoDB.
  - `helpers/`: Manejo dinámico de JWT (`jwt.js`), validaciones robustas y configuración del almacenamiento temporal y definitivo de subidas de archivos usando `multer.js`. Modeleros y limpieza de palabras (`moderation`).

### Frontend (`/frontend`)
Desarrollado con el framework **Angular 21**. Es una SPA que aprovecha las ventajas reactivas propias de Angular.

Estructura destacada dentro de `src/app/`:
- `components/`: UI de la aplicación separada de manera lógica. Encontrarás carpetas como `auth` (Login, Register), `articles` (Galería, Detalle, Crear), `admin-panel` y generadores `ia`.
- `services/`: Las clases de Angular encargadas de la comunicación con el Backend a través de HTTP Request o estado global de componentes (Auth.service, Article.service).
- `guards/`: Rutas protegidas a nivel del front: `auth.guard.ts` (solo para usuarios loqueados) o `admin.guard.ts` (solo accesible por administradores).
- `interceptors/`: `auth.interceptor.ts`. Adjunta automáticamente el `Bearer Token` de JWT en cada petición que salga desde Angular hacia el Backend. Se encarga de captar respuestas `401 Unauthorized` e intentar refrescar el token de manera transparente para el usuario.
- `styles.css`: Hojas de estilo globales que alimentan los componentes.

---

## 🛠️ Cómo Iniciar y Entender el Código (Instrucciones de Despliegue)

Para levantar esta aplicación y todo su encanto, sigue este instructivo paso a paso.

### 1️⃣ Clonar el Repositorio

Abre tu terminal favorita (Git Bash, PowerShell, Terminal de Mac/Linux) y ejecuta el comando de clonación (reemplaza `TU_URL_DE_GITHUB.git` si lo has subido o bájalo como .zip):
```bash
git clone https://github.com/tu-usuario/Proyecto-1.git
cd Proyecto-1
```

*(Si ya estás en la ruta `Proyecto-1/`, ¡genial!)*

### 2️⃣ Requisitos Previos

Antes de ejecutar comandos asegura tener instalado lo siguiente en tu máquina:
- **Node.js** (versión 18 o superior). Verifica con `node -v`
- **MongoDB** corriendo en local (por el puerto 27017) o disponer de una URL ("Connection String") de un cluster externo como **MongoDB Atlas**. Verifícalo antes de seguir.

### 3️⃣ Configurar de las Variables de Entorno del Backend (.env)

El Backend requiere datos sensibles (que no se suben al control de versiones de Git). 

1. Sitúate en la carpeta **API**:
   ```bash
   cd api
   ```
2. Crea un archivo de texto plano y llámalo explícitamente **`.env`**
3. Carga el archivo con las variables vitales de configuración del servidor. Ejemplo:

   ```env
   # .env
   PORT=4009
   MONGO_URL=mongodb://localhost:27017/tu-basededatos-local
   SECRET_KEY_JWT=cualquierPalabraSeguraParaTokens2025*!
   HF_API_KEY=tu_token_de_hugging_face_aqui_hf_...
   ```
   > **⚠️ Aviso HF_API_KEY:** Puedes obtener uno registrándote gratuitamente en la web de [Hugging Face](https://huggingface.co). ¡Es necesario para generar imágenes!

---

### 4️⃣ Instalación de Dependencias 📦

Hay que instalar las librerías base (los `node_modules`) tanto para la API como para el Frontend.

**Para el Backend (`api`)** (Asumiendo que estás dentro de la carpeta `api`):
```bash
npm install
```

**Para el Frontend (`frontend`)**:
Vuelve a la raíz del proyecto y entra a la carpeta frontend:
```bash
cd ../frontend
npm install
```

---

### 5️⃣ ¡Hora de Ejecutar en Desarrollo! ⚙️

Necesitarás al menos **dos ventanas de la terminal** abiertas (una ejecutando la API, y otra el Frontend).

**Terminal 1 (Backend):**
```bash
cd api
npm start
```
*Si todo está bien, verás un texto por consola: "✅ Conectado a MongoDB" seguido de "Servidor corriendo en el puerto 4009". (Utiliza `nodemon` internamente para reiniciar solo si modificas código)*.

**Terminal 2 (Frontend - Angular):**
```bash
cd frontend
npm start
```
*Espera a que Angular compile todo. Cuando termine avisará que está listo escuchando en `http://localhost:4200`*.

---

### 6️⃣ Probar la Web y Entender el flujo 🕹️

Abra su navegador de internet e ingrese a:
👉 `http://localhost:4200`

- Llegarás a la Galería o Home de inicio. Como no estás logeado, el contenido estará bloqueado o limitado temporalmente.
- Debes ir al panel de  **Registrarse** y crear tu primer usuario. Inmediatamente podrás logearte. 
- Puedes probar a crear un artículo desde tu panel.
- Una vez logeado, se generará el JWT. El Interceptor de Angular enviará el Token a `/api/articles/` automáticamente mediante los HEADERS HTTP en todas las próximas peticiones.

---

### 7️⃣ (Opcional pero Recomendado): Otorgarte Rol de Super Admin

El sistema tiene un Helper / Script para crearse automáticamente a sí mismo como *Super Admin*. Manteniendo la terminal 1 (api) corriendo o abriendo una nueva (terminal 3):

```bash
cd api
node create-admin.js el.correo.que.registraste@dominio.com
```

Este script se conectará a Mongo y reemplazará tu perfil normal dándote atributos de `role: "superadmin"`. 
Luego de setearte, logeate en el frontend de nuevo (o recarga el navegador). ¡Ahora verás la pestaña secreta **Admin Panel** y podrás censurar cosas, ver logs y más!

---

## 📝 Documentación Swagger (API Docs)

Si sos desarrollador o te gustaría ver cómo actúan las URL de manera nativa sin el cliente de Angular, el servidor viene equipado con Swagger. Podés probar todos los endpoints y leer sobre el objeto JSON de entrada directamente entrando a:

👉 **`http://localhost:4009/api-docs`**

## 🌐 Despliegue a Producción (Checklist)

Tenga esto en cuenta llegado el momento de subir el proyecto a servidores remotos como Render.com, Heroku, Vercel, o VPS:
- [ ] Recordar abrir `.gitignore` y asegurarse de que los `node_modules` y `.env` no queden guardados en el Repositorio de GitHub.
- [ ] En la configuración del host del Backend, setear las Enviroment Variables equivalentes a como estaban en tu `.env`. (Modificar `MONGO_URL` hacia Atlas Cloud).
- [ ] Actualizar en el frontend el archivo `/src/app/services/Global.ts` mutando `url:` de localhost a la IP o DNS definitiva donde se aloja ahora el backend, y el puerto.
- [ ] Probar todo el flujo (registro, IA, bloqueo) desde un celular o de incógnito.

## 🤝 Autor

Matias Marcelo Dei Castelli.
Proyecto desarrollado como portafolio personal de desarrollo Web.
