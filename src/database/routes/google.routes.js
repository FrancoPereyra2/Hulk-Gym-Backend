import express from "express";
import { googleAuth } from "../../controllers/authController.js"; 

const router = express.Router();

router.post("/auth", googleAuth);

export default router;