import express from "express";
import {
  obtenerClientes,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  renovarMembresia,
  togglePagoMes,
  obtenerClientePorEmail
} from "../../controllers/clienteController.js";

import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/email/:email", verificarToken, obtenerClientePorEmail);

router.get("/", verificarToken, soloAdmin, obtenerClientes);
router.get("/:id", verificarToken, soloAdmin, obtenerClientePorId);
router.put("/:id", verificarToken, soloAdmin, actualizarCliente);
router.delete("/:id", verificarToken, soloAdmin, eliminarCliente);
router.patch("/:id/renovar", verificarToken, soloAdmin, renovarMembresia);

export default router;
