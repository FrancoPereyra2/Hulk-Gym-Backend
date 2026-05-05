import Cliente from "../database/model/Clientes.js";

export const estadisticasClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();

    let activos = 0;
    let vencidos = 0;

    clientes.forEach(c => {
      if (!c.vencimiento) {
        vencidos++;
        return;
      }

      const partes = c.vencimiento.split("/");
      if (partes.length === 3) {
        const d = Number(partes[0]);
        const m = Number(partes[1]) - 1;
        const y = Number(partes[2]);
        const fechaVenc = new Date(y, m, d, 23, 59, 59);

        if (fechaVenc >= new Date()) {
          activos++;
        } else {
          vencidos++;
        }
      } else {
        vencidos++;
      }
    });

    res.json({ activos, vencidos, total: clientes.length });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};

export const ingresosMes = async (req, res) => {
  try {
    const clientes = await Cliente.find({ pagoMesActual: true });

    const montoPorPago = 10000;
    const ingresos = clientes.length * montoPorPago;

    res.json({ pagosConfirmados: clientes.length, ingresos });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error: error.message });
  }
};
