const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registroSchema = new Schema({
// Campos para autenticación tradicional
correo: { type: String, required: function() { return !this.googleId; }, unique: true },
contrasenia: { type: String, required: function() { return !this.googleId; } },
pin: { type: String, required: function() { return !this.googleId; } },

// Campos para autenticación Google
googleId: { type: String, unique: true, sparse: true },
profilePicture: { type: String },
fechaRegistroGoogle: { type: Date },

// Datos personales
nombre: { type: String, required: true },
apellidos: { type: String, required: true },
telefono: { type: String, required: true },
pais: { type: String },
fechaNacimiento: { type: Date, required: true },
direccion: { type: String },

// Estado y verificación
estado: { type: String, enum: ['pendiente', 'activo', 'suspendido'], default: 'pendiente' },
metodoRegistro: { type: String, enum: ['google', 'formulario'], required: true },
registroCompleto: { type: Boolean, default: false },
verificacionToken: { type: String },
verificationCode: { type: String },

// Timestamps automáticos
}, { timestamps: true });

module.exports = mongoose.model('Registro', registroSchema);