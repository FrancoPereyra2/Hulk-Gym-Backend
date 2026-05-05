import express from "express";
import { getUsuarios } from "../../controllers/adminController.js";

const router = express.Router();

router.get("/usuarios", getUsuarios);

export default router;
