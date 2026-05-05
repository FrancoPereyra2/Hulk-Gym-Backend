import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, default: "" }, 
  dni: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String, default: null }, 

  fechaRegistro: { type: Date, default: Date.now },

  membresia: {
    tipo: { type: String, default: "Mensual" },
    fechaInicio: { type: Date },
    fechaVencimiento: { type: Date },
    precio: { type: Number, default: 10000 }
  },

  estadoCuenta: { type: String, default: "Activo" },
  pagoMesActual: { type: Boolean, default: false },
  fechaUltimoPago: { type: Date },

  rol: { type: String, default: "cliente" },
  refreshToken: { type: String },

  passwordTemporal: { type: Boolean, default: false },
  tokenCambioPassword: { type: String },
  tokenCambioPasswordExpira: { type: Date },
  cuentaActivada: { type: Boolean, default: false },
  fechaActivacion: { type: Date }
});

const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;