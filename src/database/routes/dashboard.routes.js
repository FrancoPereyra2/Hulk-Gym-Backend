import express from "express";
import { estadisticasClientes, ingresosMes } from "../../controllers/dashboardController.js";
import { verificarToken, soloAdmin } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/clientes", verificarToken, soloAdmin, estadisticasClientes);
router.get("/ingresos", verificarToken, soloAdmin, ingresosMes);

export default router;
