import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  clienteNombre: String,
  clienteDNI: String,
  clienteEmail: String,
  tipo: String, 
  fechaEnvio: { type: Date, default: Date.now },
  estado: String,  
  error: String,
  asunto: String
});

export default mongoose.model("EmailHistorial", emailSchema);