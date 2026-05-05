import crypto from "crypto";
import TokenActivacion from "../database/model/TokenActivacion.js";
import Cliente from "../database/model/Clientes.js";

export const generarToken = async (req, res) => {
  try {
    const { clienteId, clienteDNI } = req.body;

    const cliente = await Cliente.findById(clienteId);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 24); 

    const nuevoToken = new TokenActivacion({
      token,
      clienteId,
      clienteDNI,
      fechaExpiracion: expiracion
    });

    await nuevoToken.save();

    res.json({ mensaje: "Token generado", token: nuevoToken });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const validarToken = async (req, res) => {
  try {
    const { token, dni } = req.params;

    const tokenDoc = await TokenActivacion.findOne({ token, clienteDNI: dni });
    if (!tokenDoc) return res.status(404).json({ mensaje: "Token no encontrado" });

    if (tokenDoc.usado) return res.status(400).json({ mensaje: "Token ya usado" });
    if (tokenDoc.fechaExpiracion < new Date()) return res.status(400).json({ mensaje: "Token expirado" });

    res.json({ valido: true, clienteId: tokenDoc.clienteId });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const usarToken = async (req, res) => {
  try {
    const { token } = req.params;

    const tokenDoc = await TokenActivacion.findOne({ token });
    if (!tokenDoc) return res.status(404).json({ mensaje: "Token no encontrado" });

    if (tokenDoc.usado) return res.status(400).json({ mensaje: "Token ya usado" });
    if (tokenDoc.fechaExpiracion < new Date()) return res.status(400).json({ mensaje: "Token expirado" });

    tokenDoc.usado = true;
    tokenDoc.fechaUso = new Date();
    await tokenDoc.save();

    res.json({ mensaje: "Token usado correctamente", clienteId: tokenDoc.clienteId });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};
