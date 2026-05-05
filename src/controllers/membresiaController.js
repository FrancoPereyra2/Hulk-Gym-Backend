import Cliente from "../database/model/Clientes.js";

export const marcarPagoMes = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    const nuevoEstado = !cliente.pagoMesActual;
    cliente.pagoMesActual = nuevoEstado;
    if (nuevoEstado) cliente.fechaUltimoPago = new Date();

    await cliente.save();

    res.json({
      mensaje: nuevoEstado ? "Pago confirmado" : "Pago marcado como pendiente",
      cliente
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const renovarMembresia = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    const hoy = new Date();
    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);

    const dd = fechaVencimiento.getDate().toString().padStart(2, "0");
    const mm = (fechaVencimiento.getMonth() + 1).toString().padStart(2, "0");
    const yyyy = fechaVencimiento.getFullYear();

    cliente.vencimiento = `${dd}/${mm}/${yyyy}`;
    cliente.estadoCuenta = "Activo";
    cliente.pagoMesActual = true;
    cliente.fechaUltimoPago = new Date();

    await cliente.save();

    res.json({
      mensaje: "Membresía renovada",
      nuevaVencimiento: cliente.vencimiento,
      cliente
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const estadoMembresia = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findById(id);
    if (!cliente) return res.status(404).json({ mensaje: "Cliente no encontrado" });

    const partes = (cliente.vencimiento || "").split("/");
    let estado = "Activo";
    if (partes.length === 3) {
      const d = Number(partes[0]), m = Number(partes[1]) - 1, y = Number(partes[2]);
      const venc = new Date(y, m, d, 23, 59, 59);
      estado = venc >= new Date() ? "Activo" : "Expirada";
    }

    res.json({
      clienteId: cliente._id,
      vencimiento: cliente.vencimiento || null,
      estado,
      pagoMesActual: Boolean(cliente.pagoMesActual),
      fechaUltimoPago: cliente.fechaUltimoPago || null
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};
