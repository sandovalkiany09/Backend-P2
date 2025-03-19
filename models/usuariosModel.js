const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registroSchema = new Schema({
  correo: { type: String, required: true, unique: true },
  contrasenia: { type: String, required: true },
  telefono: { type: String, required: true },
  pin: { type: String, required: true }, 
  nombre: { type: String, required: true },
  apellidos: { type: String, required: true },
  pais: { type: String },
  fechaNacimiento: { type: Date, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Registro', registroSchema);