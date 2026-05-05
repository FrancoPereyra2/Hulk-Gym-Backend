import mongoose from "mongoose";

const ejercicioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  series: { type: Number, required: true, min: 1 },
  repeticiones: { type: Number, required: true, min: 1 },
  descansoSeg: { type: Number, default: 60 }
}, { _id: false });

const rutinaSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    trim: true 
  },
  ejercicios: {
    type: [ejercicioSchema],
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'Debe incluir al menos un ejercicio'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model("Rutina", rutinaSchema);