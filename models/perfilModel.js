const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Modelo de perfiles
const PerfilSchema = new Schema({
  usuarioId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Registro', // Referencia al modelo de usuarios
    required: true 
  },
  nombre: { 
    type: String, 
    required: true 
  },
  imagen: { 
    type: String, 
    required: true 
  },
}, {
  timestamps: true // Agrega campos createdAt y updatedAt automáticamente
});

module.exports = mongoose.model('Perfil', PerfilSchema);