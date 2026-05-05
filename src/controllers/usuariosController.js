import Usuario from "../database/model/Usuario.js";
import Cliente from "../database/model/Clientes.js";
import bcrypt from "bcryptjs";

// Obtener todos los usuarios
export const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.find().select("-password");
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error: error.message });
  }
};

// Obtener usuario por ID
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario = await Usuario.findById(id).select("-password");
    
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuario", error: error.message });
  }
};

// ✅ NUEVA: Obtener usuario por EMAIL (para clientes que quieren ver su info)
export const obtenerUsuarioPorEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    console.log(`🔍 Buscando usuario con email: ${email}`);
    
    // Buscar el usuario por email
    const usuario = await Usuario.findOne({ email: email.trim() }).select("-password");
    
    if (!usuario) {
      console.log(`❌ Usuario no encontrado con email: ${email}`);
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    // Si es cliente, buscar su información de cliente asociada
    if (usuario.rol === "cliente") {
      const cliente = await Cliente.findOne({ email: email.trim() });
      
      if (cliente) {
        // Combinar información de usuario y cliente
        const infoCompleta = {
          id: usuario._id,
          _id: usuario._id,
          nombre: cliente.nombre || usuario.nombre,
          email: usuario.email,
          dni: cliente.dni,
          fechaInicio: cliente.fechaInicio,
          vencimiento: cliente.vencimiento,
          precio: cliente.precio || 10000,
          estadoCuenta: cliente.estadoCuenta || 'Activo',
          pagoMesActual: cliente.pagoMesActual || false,
          cuentaActivada: cliente.cuentaActivada || false,
          rol: usuario.rol
        };
        
        console.log(`✅ Cliente encontrado: ${cliente.nombre}`);
        return res.json(infoCompleta);
      }
    }
    
    // Si no es cliente o no tiene registro de cliente, devolver solo info de usuario
    console.log(`✅ Usuario encontrado: ${usuario.nombre}`);
    res.json(usuario);
  } catch (error) {
    console.error('❌ Error buscando usuario por email:', error);
    res.status(500).json({ mensaje: "Error al buscar usuario", error: error.message });
  }
};

// Crear usuario
export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    
    // Verificar si el email ya existe
    const usuarioExiste = await Usuario.findOne({ email });
    if (usuarioExiste) {
      return res.status(400).json({ mensaje: "El email ya está registrado" });
    }
    
    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: passwordHash,
      rol
    });
    
    await nuevoUsuario.save();
    
    // No devolver la contraseña
    const usuarioSinPassword = nuevoUsuario.toObject();
    delete usuarioSinPassword.password;
    
    console.log(`✅ Usuario creado: ${nombre}`);
    res.status(201).json(usuarioSinPassword);
  } catch (error) {
    console.error('❌ Error creando usuario:', error);
    res.status(500).json({ mensaje: "Error al crear usuario", error: error.message });
  }
};

// Actualizar usuario
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;
    
    const datosActualizar = { nombre, email, rol };
    
    // Si se proporciona nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      datosActualizar.password = await bcrypt.hash(password, salt);
    }
    
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      id,
      datosActualizar,
      { new: true, runValidators: true }
    ).select("-password");
    
    if (!usuarioActualizado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    console.log(`✅ Usuario actualizado: ${usuarioActualizado.nombre}`);
    res.json(usuarioActualizado);
  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);
    res.status(500).json({ mensaje: "Error al actualizar usuario", error: error.message });
  }
};

// Eliminar usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    
    const usuarioEliminado = await Usuario.findByIdAndDelete(id);
    
    if (!usuarioEliminado) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    
    console.log(`✅ Usuario eliminado: ${usuarioEliminado.nombre}`);
    res.json({ mensaje: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error('❌ Error eliminando usuario:', error);
    res.status(500).json({ mensaje: "Error al eliminar usuario", error: error.message });
  }
};

// ✅ NUEVA: Buscar cliente por DNI
export const buscarClientePorDni = async (req, res) => {
  try {
    const { dni } = req.params;
    
    console.log(`🔍 Buscando cliente con DNI: ${dni}`);
    
    // Buscar cliente por DNI
    const cliente = await Cliente.findOne({ dni: dni.trim() });
    
    if (!cliente) {
      console.log(`❌ Cliente no encontrado con DNI: ${dni}`);
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }
    
    // Devolver información completa del cliente
    const infoCliente = {
      id: cliente._id,
      _id: cliente._id,
      nombre: cliente.nombre || '',
      apellido: cliente.apellido || '',
      dni: cliente.dni,
      email: cliente.email,
      fechaInicio: cliente.fechaInicio,
      vencimiento: cliente.vencimiento,
      precio: cliente.precio || 10000,
      estadoCuenta: cliente.estadoCuenta || 'Activo',
      pagoMesActual: cliente.pagoMesActual || false,
      cuentaActivada: cliente.cuentaActivada || false,
      rol: 'cliente'
    };
    
    console.log(`✅ Cliente encontrado: ${cliente.nombre} ${cliente.apellido}`);
    res.json(infoCliente);
  } catch (error) {
    console.error('❌ Error buscando cliente por DNI:', error);
    res.status(500).json({ mensaje: "Error al buscar cliente", error: error.message });
  }
};

export default {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorEmail,
  buscarClientePorDni, // ✅ AGREGADO
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
};