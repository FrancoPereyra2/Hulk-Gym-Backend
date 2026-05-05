import express from "express";
import { body, param } from "express-validator";
import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";
import validarCampos from "../../middlewares/validarCampos.js";
import {
  registrarEmail,
  obtenerEmails,
  eliminarEmail
} from "../../controllers/emailController.js";

const router = express.Router();

router.post(
  "/",
  [
    body("clienteNombre").notEmpty().withMessage("El nombre del cliente es obligatorio"),
    body("clienteDNI").notEmpty().withMessage("El DNI es obligatorio"),
    body("clienteEmail").isEmail().withMessage("Debe ser un email válido"),
    body("tipo").notEmpty().withMessage("El tipo de email es obligatorio"),
    body("estado").notEmpty().withMessage("El estado es obligatorio"),
    body("asunto").notEmpty().withMessage("El asunto es obligatorio")
  ],
  validarCampos,
  verificarToken,
  soloAdmin,
  registrarEmail 
);

router.get("/", verificarToken, soloAdmin, obtenerEmails);

router.delete(
  "/:id",
  [param("id").isMongoId().withMessage("El ID debe ser válido")],
  validarCampos,
  verificarToken,
  soloAdmin,
  eliminarEmail
);

export default router;