# 🏋️‍♂️ HulkGym Backend API

<div align="center">

### ⚙️ API REST para la gestión del sistema HulkGym

Clientes • Autenticación • Emails • Administración

</div>

---

# 📖 Descripción

Este proyecto corresponde al backend del sistema **HulkGym**, encargado de manejar toda la lógica del servidor, autenticación de usuarios, gestión de clientes y envío de correos electrónicos.

La API fue desarrollada para conectar y dar soporte al panel administrativo y al panel de clientes de la aplicación principal.

---

# 🚀 Funcionalidades

## 👥 Gestión de Clientes

* Registro de nuevos clientes.
* Edición de datos.
* Eliminación de clientes.
* Listado completo de alumnos.
* Control de vencimientos.

---

## 🔐 Autenticación

* Login con credenciales.
* Login con Google.
* Generación y validación de tokens JWT.
* Encriptación de contraseñas.

---

## 📧 Sistema de Correos

* Envío de emails automáticos.
* Recordatorio de pagos vencidos.
* Verificación de clientes vencidos.

---

## 👨‍💼 Administración

* Gestión de administradores.
* Control de accesos.
* Validaciones de datos.

---

# 🛠️ Tecnologías Utilizadas

## ⚙️ Backend

* Node.js
* Express

## 🗄️ Base de Datos

* MongoDB
* Mongoose

## 🔐 Autenticación y Seguridad

* JWT
* BcryptJS
* Google Auth Library
* Firebase Admin

## 📧 Emails

* Nodemailer
* Resend

## 📦 Librerías y Herramientas

* Cors
* Dotenv
* Morgan
* Dayjs
* Express Validator
* Nodemon

---

# 📡 Endpoints Principales

## 👥 Clientes

```http
GET /clientes
POST /clientes
PUT /clientes/:id
DELETE /clientes/:id
```

---

## 🔐 Autenticación

```http
POST /login
POST /register
POST /google-login
```

---

## 📧 Emails

```http
POST /verificar-mails
POST /enviar-mail
```

---

# ▶️ Instalación

## 1️⃣ Clonar repositorio

```bash
git clone <url-del-repo>
```

---

## 2️⃣ Instalar dependencias

```bash
npm install
```

---

## 3️⃣ Configurar variables de entorno

Crear un archivo `.env`

```env
PORT=

MONGODB_URI=

JWT_SECRET=

GOOGLE_CLIENT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

RESEND_API_KEY=
EMAIL_USER=
EMAIL_PASS=
```

---

## 4️⃣ Ejecutar servidor

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

---

# 🌐 Deploy

El backend puede desplegarse en plataformas como:

* Render
* Railway
* Vercel

---

# 🎯 Objetivo del Proyecto

Brindar una API segura, escalable y organizada para la administración integral del gimnasio HulkGym.

---

# 👨‍💻 Autor

Proyecto desarrollado por **[Franco Pereyra]**

---

<div align="center">

### 💪 HulkGym Management API 💪

</div>
