import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import adminRoutes from "./src/database/routes/admin.routes.js";
import usuariosRoutes from "./src/database/routes/usuarios.routes.js";
import authRoutes from "./src/database/routes/auth.routes.js";
import tokensRoutes from "./src/database/routes/tokens.routes.js";
import emailsRoutes from "./src/database/routes/emails.routes.js";
import rutinasRoutes from "./src/database/routes/rutinas.routes.js";
import clientesRoutes from "./src/database/routes/clientes.routes.js";
import membresiasRoutes from "./src/database/routes/membresia.routes.js";
import googleRoutes from "./src/database/routes/google.routes.js";
import dashboardRoutes from "./src/database/routes/dashboard.routes.js";
import manejarErrores from "./src/middlewares/errorMiddleware.js";

import "./src/database/dbConnection.js";

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 
    'http://localhost:5174', 
    'http://127.0.0.1:5173', 
    'http://127.0.0.1:5174',
    'https://hulkgym-fitness.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options("*", cors());

app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use("/api/admin", adminRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/clientes', clientesRoutes); 
app.use("/api/tokens", tokensRoutes);
app.use("/api/emails", emailsRoutes); 
app.use("/api/rutinas", rutinasRoutes); 
app.use("/api/membresias", membresiasRoutes);
app.use("/api/google", googleRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(manejarErrores);

app.use((req, res) => {
  res.status(404).json({ mensaje: "Endpoint no encontrado" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});

export default app;