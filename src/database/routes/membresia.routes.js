import express from "express";
import Cliente from "../../database/model/Clientes.js";
import { param } from "express-validator";
import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";
import validarCampos from "../../middlewares/validarCampos.js";
import {
  marcarPagoMes,
  renovarMembresia,
  estadoMembresia
} from "../../controllers/membresiaController.js";

const router = express.Router();

router.put(
  "/:id/pago",
  verificarToken,
  soloAdmin,
  marcarPagoMes
);

router.put(
  "/:id/renovar",
  [
    param("id").isMongoId().withMessage("El ID debe ser válido"),
  ],
  validarCampos,
  verificarToken,
  soloAdmin,
  renovarMembresia
);

router.get(
  "/:id/estado",
  [param("id").isMongoId().withMessage("El ID debe ser válido")],
  validarCampos,
  verificarToken,
  estadoMembresia
);

export default router;