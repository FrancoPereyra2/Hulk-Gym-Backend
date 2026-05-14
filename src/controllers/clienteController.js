import Cliente from "../database/model/Clientes.js";
import dayjs from "dayjs";

const formatearCliente = (cliente) => ({
  id: cliente._id,
  _id: cliente._id,
  nombre: cliente.nombre,
  dni: cliente.dni,
  email: cliente.email,
  fechaInicio: cliente.fechaInicio,
  vencimiento: cliente.vencimiento,
  precio: cliente.precio || 10000,
  estadoCuenta: cliente.estadoCuenta || "Activo",
  ultimoMesPagado: cliente.ultimoMesPagado || null,
  cuentaActivada: cliente.cuentaActivada || false,
  fechaUltimoPago: cliente.fechaUltimoPago || null,
  usuarioId: cliente.usuarioId,
});

export const obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find({ eliminado: { $ne: true } });

    const clientesFormateados = clientes.map(formatearCliente);

    res.json(clientesFormateados);
  } catch (error) {
    console.error("❌ Error obteniendo clientes:", error);
    res
      .status(500)
      .json({ mensaje: "Error al obtener clientes", error: error.message });
  }
};

export const obtenerClientePorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findOne({
      _id: id,
      eliminado: { $ne: true },
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json(formatearCliente(cliente));
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener cliente", error: error.message });
  }
};

export const actualizarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      dni,
      email,
      fechaInicio,
      vencimiento,
      precio,
      estadoCuenta,
    } = req.body;

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        nombre,
        dni,
        email,
        fechaInicio,
        vencimiento,
        precio,
        estadoCuenta,
      },
      { new: true, runValidators: true },
    );

    if (!clienteActualizado) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json(formatearCliente(clienteActualizado));
  } catch (error) {
    console.error("❌ Error actualizando cliente:", error);
    res
      .status(500)
      .json({ mensaje: "Error al actualizar cliente", error: error.message });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByIdAndUpdate(
      id,
      { eliminado: true, fechaEliminacion: new Date() },
      { new: true },
    );
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }
    res.json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al eliminar cliente", error: error.message });
  }
};

export const renovarMembresia = async (req, res) => {
  try {
    const { id } = req.params;

    const hoy = new Date();
    const nuevaFechaInicio = `${hoy.getDate().toString().padStart(2, "0")}/${(hoy.getMonth() + 1).toString().padStart(2, "0")}/${hoy.getFullYear()}`;

    const fechaVencimiento = new Date(hoy);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    const nuevoVencimiento = `${fechaVencimiento.getDate().toString().padStart(2, "0")}/${(fechaVencimiento.getMonth() + 1).toString().padStart(2, "0")}/${fechaVencimiento.getFullYear()}`;

    const clienteActualizado = await Cliente.findByIdAndUpdate(
      id,
      {
        fechaInicio: nuevaFechaInicio,
        vencimiento: nuevoVencimiento,
        estadoCuenta: "Activo",
        pagoMesActual: true,
        fechaUltimoPago: new Date(),
      },
      { new: true },
    );

    if (!clienteActualizado) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json(formatearCliente(clienteActualizado));
  } catch (error) {
    console.error("❌ Error renovando membresía:", error);
    res
      .status(500)
      .json({ mensaje: "Error al renovar membresía", error: error.message });
  }
};

export const togglePagoMes = async (req, res) => {
  try {
    const { id } = req.params;

    const cliente = await Cliente.findById(id);
    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const mesActual = dayjs().format("YYYY-MM");

    if (cliente.ultimoMesPagado === mesActual) {
      cliente.ultimoMesPagado = null;
    } else {
      cliente.ultimoMesPagado = mesActual;
      cliente.fechaUltimoPago = new Date();
    }

    await cliente.save();

    res.json(cliente);
  } catch (error) {
    console.error("❌ Error actualizando pago:", error);
    res.status(500).json({ mensaje: "Error al actualizar pago" });
  }
};

export const obtenerClientePorEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const cliente = await Cliente.findOne({ email, eliminado: { $ne: true } });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.json(formatearCliente(cliente));
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener cliente",
      error: error.message,
    });
  }
};

export default {
  obtenerClientes,
  obtenerClientePorId,
  obtenerClientePorEmail,
  actualizarCliente,
  eliminarCliente,
  renovarMembresia,
  togglePagoMes,
};
