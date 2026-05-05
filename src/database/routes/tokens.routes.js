import express from "express";
import { generarToken, validarToken, usarToken } from "../../controllers/tokenController.js";

const router = express.Router();

router.post("/", generarToken);              
router.get("/:token/:dni", validarToken);    
router.put("/:token/usar", usarToken);       

export default router;
