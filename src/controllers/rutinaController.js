import Rutina from "../database/model/Rutina.js";

export const crearRutina = async (req, res) => {
  try {
    const { nombre, ejercicios } = req.body;

    const nuevaRutina = new Rutina({ nombre, ejercicios });
    await nuevaRutina.save();

    res.status(201).json({ 
      mensaje: "Rutina creada exitosamente", 
      rutina: nuevaRutina 
    });
  } catch (error) {
    console.error('Error al crear rutina:', error);
    res.status(500).json({ 
      mensaje: "Error al crear la rutina", 
      error: error.message 
    });
  }
};

export const obtenerRutinas = async (req, res) => {
  try {
    const rutinas = await Rutina.find().sort({ createdAt: -1 });
    res.json(rutinas);
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    res.status(500).json({ 
      mensaje: "Error al obtener las rutinas", 
      error: error.message 
    });
  }
};

export const obtenerRutinaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rutina = await Rutina.findById(id);
    
    if (!rutina) {
      return res.status(404).json({ mensaje: "Rutina no encontrada" });
    }
    
    res.json(rutina);
  } catch (error) {
    console.error('Error al obtener rutina:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ mensaje: "ID de rutina inválido" });
    }
    
    res.status(500).json({ 
      mensaje: "Error al obtener la rutina", 
      error: error.message 
    });
  }
};

export const actualizarRutina = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, ejercicios } = req.body;
    
    const rutinaActualizada = await Rutina.findByIdAndUpdate(
      id, 
      { nombre, ejercicios },
      { new: true, runValidators: true }
    );
    
    if (!rutinaActualizada) {
      return res.status(404).json({ mensaje: "Rutina no encontrada" });
    }
    
    res.json({ 
      mensaje: "Rutina actualizada exitosamente", 
      rutina: rutinaActualizada 
    });
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ mensaje: "ID de rutina inválido" });
    }
    
    res.status(500).json({ 
      mensaje: "Error al actualizar la rutina", 
      error: error.message 
    });
  }
};

export const eliminarRutina = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rutinaEliminada = await Rutina.findByIdAndDelete(id);
    
    if (!rutinaEliminada) {
      return res.status(404).json({ mensaje: "Rutina no encontrada" });
    }
    
    res.json({ 
      mensaje: "Rutina eliminada exitosamente", 
      rutina: rutinaEliminada 
    });
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ mensaje: "ID de rutina inválido" });
    }
    
    res.status(500).json({ 
      mensaje: "Error al eliminar la rutina", 
      error: error.message 
    });
  }
};