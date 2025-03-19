const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Modelo de perfiles
const perfilSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  nombre: { type: String, required: true },
  pin: { type: String, required: true },
  imagen: { type: String, required: true } 
}, { timestamps: true });

module.exports = mongoose.model('Perfil', perfilSchema);