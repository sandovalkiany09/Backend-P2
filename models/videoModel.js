const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  playlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist', required: true },
  nombre: { type: String, required: true },
  url: { type: String, required: true },
  descripcion: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
