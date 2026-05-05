import express from "express";
import { body } from "express-validator";
import validarCampos from "../../middlewares/validarCampos.js";
import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorEmail,
  buscarClientePorDni, 
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from "../../controllers/usuariosController.js";

const router = express.Router();

router.get("/email/:email", verificarToken, obtenerUsuarioPorEmail);

router.get("/dni/:dni", verificarToken, soloAdmin, buscarClientePorDni);

router.get("/", verificarToken, soloAdmin, obtenerUsuarios);
router.get("/:id", verificarToken, soloAdmin, obtenerUsuarioPorId);

router.post(
  "/",
  [
    body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
    body("email").isEmail().withMessage("Debe ser un email válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("rol")
      .isIn(["admin", "cliente"])
      .withMessage("El rol debe ser admin o cliente"),
  ],
  validarCampos,
  verificarToken,
  soloAdmin,
  crearUsuario
);

router.put(
  "/:id",
  [
    body("nombre").optional().notEmpty().withMessage("El nombre no puede estar vacío"),
    body("email").optional().isEmail().withMessage("Debe ser un email válido"),
    body("password")
      .optional()
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
    body("rol")
      .optional()
      .isIn(["admin", "cliente"])
      .withMessage("El rol debe ser admin o cliente"),
  ],
  validarCampos,
  verificarToken,
  soloAdmin,
  actualizarUsuario
);

router.delete("/:id", verificarToken, soloAdmin, eliminarUsuario);

export default router;