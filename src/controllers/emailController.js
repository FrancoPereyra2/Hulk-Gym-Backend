import EmailHistorial from "../database/model/EmailHistorial.js";

export const registrarEmail = async (req, res) => {
  try {
    const nuevoEmail = new EmailHistorial(req.body);
    await nuevoEmail.save();
    res.status(201).json(nuevoEmail);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar el email" });
  }
};

export const obtenerEmails = async (req, res) => {
  try {
    const emails = await EmailHistorial.find({}).sort({ fechaEnvio: -1 });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el historial de emails" });
  }
};

export const eliminarEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const emailEliminado = await EmailHistorial.findByIdAndDelete(id);
    if (!emailEliminado) return res.status(404).json({ mensaje: "Registro no encontrado" });
    res.json({ mensaje: "Registro eliminado", email: emailEliminado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};
