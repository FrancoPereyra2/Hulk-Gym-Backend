import express from "express";
import { body } from "express-validator";
import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";
import validarCampos from "../../middlewares/validarCampos.js";
import {
  obtenerRutinas,
  crearRutina,
  actualizarRutina,
  eliminarRutina
} from "../../controllers/rutinaController.js";

const router = express.Router();

router.get("/", verificarToken, obtenerRutinas);

router.post(
  "/",
  [
    body("nombre")
      .notEmpty()
      .withMessage("El nombre de la rutina es obligatorio"),
    body("ejercicios")
      .isArray({ min: 1 })
      .withMessage("Debe incluir al menos un ejercicio"),
    body("ejercicios.*.nombre")
      .notEmpty()
      .withMessage("Cada ejercicio debe tener nombre"),
    body("ejercicios.*.series")
      .isInt({ min: 1 })
      .withMessage("Las series deben ser un número positivo"),
    body("ejercicios.*.repeticiones")
      .isInt({ min: 1 })
      .withMessage("Las repeticiones deben ser un número positivo"),
    body("ejercicios.*.descansoSeg")
      .optional()
      .isInt({ min: 10 })
      .withMessage("El descanso debe ser un número mayor a 10 segundos")
  ],
  validarCampos,
  verificarToken,
  soloAdmin,
  crearRutina
);

router.put(
  "/:id",
  [
    body("nombre")
      .optional()
      .notEmpty()
      .withMessage("El nombre de la rutina no puede estar vacío"),
    body("ejercicios")
      .optional()
      .isArray()
      .withMessage("Ejercicios debe ser un array"),
    body("ejercicios.*.nombre")
      .optional()
      .notEmpty()
      .withMessage("Cada ejercicio debe tener nombre"),
    body("ejercicios.*.series")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Las series deben ser un número positivo"),
    body("ejercicios.*.repeticiones")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Las repeticiones deben ser un número positivo"),
    body("ejercicios.*.descansoSeg")
      .optional()
      .isInt({ min: 10 })
      .withMessage("El descanso debe ser un número mayor a 10 segundos")
  ],
  validarCampos,
  verificarToken,
  soloAdmin,
  actualizarRutina
);

router.delete("/:id", verificarToken, soloAdmin, eliminarRutina);

export default router;
