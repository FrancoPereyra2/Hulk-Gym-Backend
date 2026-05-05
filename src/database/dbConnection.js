import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

console.log("⚡ Iniciando conexión a MongoDB...");

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas conectado exitosamente");
    console.log("========================================");
  })
  .catch((error) => {
    console.error("❌ Error conectando a MongoDB:");
    console.error(error.message);
    console.log("========================================");
    process.exit(1);
  });

const db = mongoose.connection;

db.on("connecting", () => console.log("⚡ Intentando conectar a MongoDB..."));
db.on("connected", () => console.log("✅ Conexión establecida con MongoDB"));
db.on("error", (err) => console.error("❌ Error en la conexión de MongoDB:", err.message));
db.on("disconnected", () => console.log("⚠️  MongoDB desconectado"));
