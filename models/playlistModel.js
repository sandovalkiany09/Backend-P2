const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const playlistSchema = new Schema({
  usuarioId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  nombre: { type: String, required: true },
  perfilesAsociados: [{ type: Schema.Types.ObjectId, ref: 'Perfil', required: true }]
}, { timestamps: true });

module.exports = mongoose.model('Playlist', playlistSchema);
