import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  clienteId: { type: mongoose.Schema.Types.ObjectId, ref: "Cliente", required: true },
  clienteDNI: { type: String, required: true },
  fechaExpiracion: { type: Date, required: true },
  usado: { type: Boolean, default: false },
  fechaUso: { type: Date }
});

export default mongoose.model("TokenActivacion", tokenSchema);
