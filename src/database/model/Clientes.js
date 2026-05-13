import mongoose from "mongoose";

const clienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido: { type: String, default: "" },
  dni: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  googleId: { type: String, default: null },
  refreshToken: { type: String },

  fechaRegistro: { type: Date, default: Date.now },

  fechaInicio: { type: String },
  vencimiento: { type: String },
  precio: { type: Number, default: 10000 },

  estadoCuenta: { type: String, default: "Activo" },
  pagoMesActual: { type: Boolean, default: false },
  ultimoMesPagado: {
    type: String,
    default: null,
  },

  rol: {
    type: String,
    enum: ["admin", "cliente"],
    default: "cliente",
  },

  fechaUltimoPago: { type: Date },

  passwordTemporal: { type: Boolean, default: false },
  tokenCambioPassword: { type: String },
  tokenCambioPasswordExpira: { type: Date },
  cuentaActivada: { type: Boolean, default: false },
  fechaActivacion: { type: Date },
  eliminado: { type: Boolean, default: false },
  fechaEliminacion: { type: Date, default: null },
});

const Cliente = mongoose.model("Cliente", clienteSchema);
export default Cliente;
