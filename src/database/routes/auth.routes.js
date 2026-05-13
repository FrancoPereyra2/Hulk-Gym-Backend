import express from "express";
import {
  registrarUsuario,
  loginUsuario,
  refreshToken,
  logoutUsuario,
  verificarPrimerUsuario,
  registrarPrimerAdmin,
  registrarClientePorAdmin,
  registrarNuevoAdmin,
  cambiarPassword,
  verificarTokenCambioPassword,
  googleAuth,
  listarAdmins,
  editarAdmin,
  eliminarAdmin
} from "../../controllers/authController.js";
import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";
import { forgotPassword } from "../../controllers/authController.js";


const router = express.Router();

router.get("/verificar-primer-usuario", verificarPrimerUsuario);
router.post("/registro", registrarUsuario);
router.post("/login", loginUsuario);
router.post("/refresh", refreshToken);
router.post("/logout", verificarToken, logoutUsuario);
router.post("/cambiar-password", cambiarPassword);
router.get("/verificar-token", verificarTokenCambioPassword);
router.post("/registrar-cliente", verificarToken, soloAdmin, registrarClientePorAdmin);
router.post("/registrar-admin", verificarToken, soloAdmin, registrarNuevoAdmin);
router.post("/forgot-password", forgotPassword);
router.get("/admins", verificarToken, soloAdmin, listarAdmins);
router.put("/admins/:id", verificarToken, soloAdmin, editarAdmin);
router.delete("/admins/:id", verificarToken, soloAdmin, eliminarAdmin);

export default router;