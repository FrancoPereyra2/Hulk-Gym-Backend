import Usuario from "../database/model/Usuario.js";
import Cliente from "../database/model/Clientes.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import crypto from "crypto";

if (!admin.apps.length) {
  try {
    if (
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });

      console.log("✅ Firebase Admin inicializado");
    } else {
      console.warn("⚠️ Firebase NO configurado (modo local)");
    }
  } catch (error) {
    console.error("❌ Error inicializando Firebase Admin:", error);
  }
}

const generarAccessToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      rol: usuario.rol,
      email: usuario.email,
    },
    process.env.JWT_SECRET || "mi_secreto",
    { expiresIn: "15m" },
  );
};

const generarRefreshToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      rol: usuario.rol,
      email: usuario.email,
    },
    process.env.JWT_REFRESH_SECRET || "mi_refresh_secreto",
    { expiresIn: "7d" },
  );
};

const generarPasswordAleatorio = (longitud = 10) => {
  const caracteres =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  let password = "";
  for (let i = 0; i < longitud; i++) {
    password += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length),
    );
  }
  return password;
};

const generarTokenCambioPassword = () => {
  return crypto.randomBytes(32).toString("hex");
};

const crearTransporteEmail = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const enviarEmailBienvenida = async (
  usuario,
  passwordTemporal,
  tokenCambio,
) => {
  const transporter = crearTransporteEmail();
  const frontendUrl = (
    process.env.FRONTEND_URL ||
    process.env.FRONTEND_URL_ALT ||
    "https://hulkgym-fitness.netlify.app"
  ).replace(/\/+$/, "");
  const urlCambioPassword = `${frontendUrl}/login?token=${tokenCambio}&email=${usuario.email}`;

  const mailOptions = {
    from: `"HULK GYM" <${process.env.EMAIL_USER}>`,
    to: usuario.email,
    subject: "🏋️ ¡Bienvenido a HULK GYM! - Activa tu cuenta",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🏋️ HULK GYM</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">¡Hola ${usuario.nombre}!</h2>
          <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales temporales:</p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Contraseña temporal:</strong> ${passwordTemporal}</p>
          </div>
          <p style="color: #dc3545;"><strong>⚠️ Importante:</strong> Por seguridad, debes cambiar tu contraseña antes de poder acceder al sistema.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${urlCambioPassword}" style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              CAMBIAR CONTRASEÑA
            </a>
          </div>
          <p style="color: #6c757d; font-size: 12px;">Este enlace expira en 7 días.</p>
        </div>
      </div>
    `,
  };
  return transporter.sendMail(mailOptions);
};

export const verificarPrimerUsuario = async (req, res) => {
  try {
    const cantidadUsuarios = await Usuario.countDocuments();
    res.json({
      esPrimerUsuario: cantidadUsuarios === 0,
      totalUsuarios: cantidadUsuarios,
    });
  } catch (err) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const registrarPrimerAdmin = async (req, res) => {
  try {
    const cantidadUsuarios = await Usuario.countDocuments();
    if (cantidadUsuarios > 0) {
      return res.status(403).json({
        mensaje:
          "Ya existe un administrador. El registro público está deshabilitado.",
      });
    }
    const { nombre, apellido, dni, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const nuevoAdmin = new Usuario({
      nombre,
      apellido,
      dni,
      email,
      password: hashedPassword,
      rol: "admin",
      cuentaActivada: true,
      fechaActivacion: new Date(),
    });
    await nuevoAdmin.save();
    res.json({
      mensaje: "Administrador registrado exitosamente",
      usuario: {
        id: nuevoAdmin._id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const registrarClientePorAdmin = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, fechaInicio, vencimiento, precio } =
      req.body;
    if (!req.user || req.user.rol !== "admin") {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para registrar clientes" });
    }
    const existeCliente = await Cliente.findOne({ email: email.toLowerCase() });
    if (existeCliente) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }
    const existeDni = await Cliente.findOne({ dni });
    if (existeDni) {
      return res.status(400).json({ mensaje: "El DNI ya está registrado" });
    }
    const passwordTemporal = generarPasswordAleatorio();
    const tokenCambio = generarTokenCambioPassword();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(passwordTemporal, salt);
    const hoy = new Date().toISOString().split("T")[0];
    const unMesDespues = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const nuevoCliente = new Cliente({
      nombre: nombre || "",
      apellido: apellido || "",
      dni,
      email: email.toLowerCase(),
      password: hashedPassword,
      passwordTemporal: true,
      tokenCambioPassword: tokenCambio,
      tokenCambioPasswordExpira: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      cuentaActivada: false,
      estadoCuenta: "Activo",
      pagoMesActual: false,
      fechaInicio: fechaInicio || hoy,
      vencimiento: vencimiento || unMesDespues,
      precio: precio || 10000,
    });

    await nuevoCliente.save();

    await enviarEmailBienvenida(nuevoCliente, passwordTemporal, tokenCambio);

    const response = {
      mensaje: "Cliente registrado exitosamente.",
      cliente: {
        id: nuevoCliente._id,
        nombre: `${nuevoCliente.nombre} ${nuevoCliente.apellido || ""}`.trim(),
        dni: nuevoCliente.dni,
        email: nuevoCliente.email,
        fechaInicio: nuevoCliente.fechaInicio,
        vencimiento: nuevoCliente.vencimiento,
        precio: nuevoCliente.precio,
        estadoCuenta: nuevoCliente.estadoCuenta,
        pagoMesActual: nuevoCliente.pagoMesActual,
        cuentaActivada: nuevoCliente.cuentaActivada,
      },
    };

    res.json(response);

    enviarEmailBienvenida(nuevoCliente, passwordTemporal, tokenCambio).catch(
      (emailError) => {
        console.error("❌ Error enviando email:", emailError.message);
      },
    );
  } catch (err) {
    res.status(500).json({
      mensaje: "Error en el servidor",
      error: err.message,
    });
  }
};

export const registrarNuevoAdmin = async (req, res) => {
  try {
    const { nombre, apellido, dni, email, password } = req.body;
    if (req.user?.rol !== "admin") {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para registrar administradores" });
    }
    const existe = await Usuario.findOne({ email });
    if (existe) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const nuevoAdmin = new Usuario({
      nombre,
      apellido,
      dni,
      email,
      password: hashedPassword,
      rol: "admin",
      cuentaActivada: true,
      fechaActivacion: new Date(),
    });
    await nuevoAdmin.save();
    res.json({
      mensaje: "Administrador registrado exitosamente",
      usuario: {
        id: nuevoAdmin._id,
        nombre: nuevoAdmin.nombre,
        email: nuevoAdmin.email,
        rol: nuevoAdmin.rol,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const registrarUsuario = async (req, res) => {
  const cantidadUsuarios = await Usuario.countDocuments();
  if (cantidadUsuarios === 0) {
    return registrarPrimerAdmin(req, res);
  }
  return res
    .status(403)
    .json({ mensaje: "El registro público está deshabilitado." });
};

export const cambiarPassword = async (req, res) => {
  try {
    const { token, email, nuevaPassword } = req.body;
    let usuario = await Cliente.findOne({
      email,
      tokenCambioPassword: token,
      tokenCambioPasswordExpira: { $gt: new Date() },
    });
    let esCliente = true;
    if (!usuario) {
      usuario = await Usuario.findOne({
        email,
        tokenCambioPassword: token,
        tokenCambioPasswordExpira: { $gt: new Date() },
      });
      esCliente = false;
    }
    if (!usuario) {
      return res.status(400).json({
        mensaje:
          "Token inválido o expirado. Solicita un nuevo enlace al administrador.",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(nuevaPassword, salt);
    usuario.password = hashedPassword;
    usuario.passwordTemporal = false;
    usuario.tokenCambioPassword = null;
    usuario.tokenCambioPasswordExpira = null;
    usuario.cuentaActivada = true;
    usuario.fechaActivacion = new Date();
    await usuario.save();
    res.json({ mensaje: "Contraseña actualizada exitosamente." });
  } catch (err) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const verificarTokenCambioPassword = async (req, res) => {
  try {
    const { token, email } = req.query;
    let usuario = await Cliente.findOne({
      email,
      tokenCambioPassword: token,
      tokenCambioPasswordExpira: { $gt: new Date() },
    });
    if (!usuario) {
      usuario = await Usuario.findOne({
        email,
        tokenCambioPassword: token,
        tokenCambioPasswordExpira: { $gt: new Date() },
      });
    }
    if (!usuario) {
      return res
        .status(400)
        .json({ valido: false, mensaje: "Token inválido o expirado" });
    }
    res.json({ valido: true, nombre: usuario.nombre, email: usuario.email });
  } catch (err) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    let usuario = await Usuario.findOne({ email });
    let esCliente = false;

    if (!usuario) {
      usuario = await Cliente.findOne({ email });
      esCliente = true;
    }

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    if (usuario.passwordTemporal) {
      return res.status(403).json({
        mensaje: "Debes cambiar tu contraseña temporal antes de continuar",
        requiereCambioPassword: true,
        tokenCambio: usuario.tokenCambioPassword,
        email: usuario.email,
      });
    }

    const rol = esCliente ? "cliente" : usuario.rol;
    const accessToken = generarAccessToken({ ...usuario.toObject(), rol });
    const refreshToken = generarRefreshToken({ ...usuario.toObject(), rol });

    usuario.refreshToken = refreshToken;
    await usuario.save();

    res.json({
      mensaje: "Login exitoso",
      accessToken,
      refreshToken,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        rol: rol,
        membresia: esCliente
          ? {
              fechaInicio: usuario.fechaInicio,
              vencimiento: usuario.vencimiento,
              precio: usuario.precio,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ mensaje: "Token de Google requerido" });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error("❌ Error verificando token:", error.message);
      return res.status(401).json({ mensaje: "Token de Google inválido" });
    }

    const { email, name, uid } = decodedToken;

    const cantidadUsuarios = await Usuario.countDocuments();
    const esPrimerUsuario = cantidadUsuarios === 0;

    let usuario = await Usuario.findOne({ email });
    let esCliente = false;

    if (!usuario) {
      usuario = await Cliente.findOne({ email });
      esCliente = !!usuario;
    }

    let puedeCrearAdmin = false;
    let adminSolicitante = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || "mi_secreto",
        );
        adminSolicitante = await Usuario.findById(decoded.id);
        if (adminSolicitante && adminSolicitante.rol === "admin") {
          puedeCrearAdmin = true;
        }
      } catch (e) {}
    }

    if (!usuario) {
      if (!esPrimerUsuario && !puedeCrearAdmin) {
        return res.status(404).json({
          mensaje:
            "No existe una cuenta registrada con este email. El administrador debe registrarte primero.",
          emailNoRegistrado: true,
        });
      }

      const nombreCompleto = name || email.split("@")[0];
      const partes = nombreCompleto.split(" ");
      const nombre = partes[0] || "Usuario";
      const apellido = partes.slice(1).join(" ") || "Google";
      const dniUnico = `G${Date.now().toString().slice(-8)}`;
      const passwordTemporal = generarPasswordAleatorio();
      const tokenCambio = generarTokenCambioPassword();
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(passwordTemporal, salt);

      usuario = new Usuario({
        nombre,
        apellido,
        dni: dniUnico,
        email,
        googleId: uid,
        password: hashedPassword,
        rol: "admin",
        cuentaActivada: true,
        fechaActivacion: new Date(),
        tokenCambioPassword: tokenCambio,
        tokenCambioPasswordExpira: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      });

      await usuario.save();

      // Enviar email para que establezca su propia contraseña
      enviarEmailBienvenida(usuario, passwordTemporal, tokenCambio).catch(
        (err) => {
          console.error(
            "❌ Error enviando email bienvenida Google:",
            err.message,
          );
        },
      );
    } else {
      if (!usuario.googleId) {
        usuario.googleId = uid;
        await usuario.save();
      }
    }

    const rol = esCliente ? "cliente" : usuario.rol;
    const plainUser = usuario.toObject
      ? usuario.toObject()
      : { ...usuario._doc };
    const accessToken = generarAccessToken({ ...plainUser, rol });
    const refreshToken = generarRefreshToken({ ...plainUser, rol });

    usuario.refreshToken = refreshToken;
    await usuario.save();

    res.json({
      mensaje: "Login exitoso con Google",
      accessToken,
      refreshToken,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        rol: rol,
        googleId: usuario.googleId,
        membresia: esCliente
          ? {
              fechaInicio: usuario.fechaInicio,
              vencimiento: usuario.vencimiento,
              precio: usuario.precio,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Error en googleAuth:", error);
    res.status(500).json({
      mensaje: "Error en el servidor",
      error: error.message,
    });
  }
};

export const refreshToken = async (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(401).json({ mensaje: "Refresh token requerido" });
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET || "mi_refresh_secreto",
    );
    const usuario = await Usuario.findById(payload.id);
    if (!usuario || usuario.refreshToken !== token) {
      return res.status(403).json({ mensaje: "Refresh token inválido" });
    }
    const newAccessToken = generarAccessToken(usuario);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ mensaje: "Refresh token inválido" });
  }
};

export const logoutUsuario = async (req, res) => {
  try {
    const { id } = req.user;
    const usuario = await Usuario.findById(id);
    if (!usuario)
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    usuario.refreshToken = null;
    await usuario.save();
    res.json({ mensaje: "Logout exitoso" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    let usuario = await Cliente.findOne({ email });

    if (!usuario) {
      usuario = await Usuario.findOne({ email });
    }

    if (!usuario) {
      return res.json({
        mensaje:
          "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    usuario.tokenCambioPassword = token;
    usuario.tokenCambioPasswordExpira = new Date(Date.now() + 60 * 60 * 1000);

    await usuario.save();

    const link = `${process.env.FRONTEND_URL}/login?token=${token}&email=${usuario.email}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial; background:#f4f4f4; padding:20px;">
<div style="max-width:600px; margin:auto; background:white; border-radius:12px; overflow:hidden;">
<div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding:40px; text-align:center;">
<h1 style="color:white;">🔐 HULK GYM</h1>
<p style="color:white;">Recuperación de Contraseña</p>
</div>

<div style="padding:40px;">
<h2>Hola ${usuario.nombre},</h2>
<p>Recibimos una solicitud para restablecer tu contraseña.</p>

<div style="text-align:center; margin:30px 0;">
<a href="${link}" 
style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
color:white;
padding:16px 40px;
text-decoration:none;
border-radius:30px;
font-weight:bold;">
RESTABLECER CONTRASEÑA
</a>
</div>

<p style="color:#856404; background:#fff3cd; padding:15px; border-radius:6px;">
⏰ Este enlace expirará en 1 hora.
</p>

</div>

<div style="background:#f8f9fa; padding:20px; text-align:center;">
© ${new Date().getFullYear()} HULK GYM
</div>

</div>
</body>
</html>
`;

    await transporter.sendMail({
      from: `"HULK GYM" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: "🔐 Recupera tu contraseña - HULK GYM",
      html,
    });

    res.json({
      mensaje:
        "Si el correo existe, se enviará un enlace para restablecer la contraseña.",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({ mensaje: "Error al enviar el correo" });
  }
};

export const listarAdmins = async (req, res) => {
  try {
    const admins = await Usuario.find({ rol: "admin" }).select("-password -refreshToken");
    res.json(admins);
  } catch (err) {
    res.status(500).json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const editarAdmin = async (req, res) => {
  try {
    const { nombre, apellido, email, dni } = req.body;
    const admin = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, email, dni },
      { new: true }
    ).select("-password -refreshToken");
    if (!admin) return res.status(404).json({ mensaje: "Admin no encontrado" });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ mensaje: "Error en el servidor", error: err.message });
  }
};

export const eliminarAdmin = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ mensaje: "No podés eliminarte a vos mismo" });
    }
    const admin = await Usuario.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ mensaje: "Admin no encontrado" });
    res.json({ mensaje: "Administrador eliminado" });
  } catch (err) {
    res.status(500).json({ mensaje: "Error en el servidor", error: err.message });
  }
};