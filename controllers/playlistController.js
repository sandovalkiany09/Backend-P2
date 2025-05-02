const Playlist = require('../models/playlistModel');
const Video = require('../models/videoModel');

exports.crearPlaylist = async (req, res) => {
  const { usuarioId, nombre, perfilesAsociados } = req.body;

  if (!usuarioId || !nombre || !perfilesAsociados || perfilesAsociados.length === 0) {
    return res.status(400).json({ error: "Todos los campos son requeridos" });
  }

  try {
    const nuevaPlaylist = new Playlist({ usuarioId, nombre, perfilesAsociados });
    const guardada = await nuevaPlaylist.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear playlist" });
  }
};

exports.obtenerPlaylists = async (req, res) => {
  const usuarioId = req.usuario?.id; 

  if (!usuarioId) {
    return res.status(400).json({ error: "Se requiere el ID del usuario" });
  }

  try {
    const playlists = await Playlist.find({ usuarioId }).populate('perfilesAsociados');

    const conConteoVideos = await Promise.all(
      playlists.map(async (pl) => {
        const conteo = await Video.countDocuments({ playlistId: pl._id });
        return { ...pl.toObject(), cantidadVideos: conteo };
      })
    );

    res.json(conConteoVideos);
  } catch (error) {
    console.error("Error al obtener playlists por usuario:", error);
    res.status(500).json({ error: "Error al obtener playlists" });
  }
};


exports.eliminarPlaylist = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "ID requerido" });

  try {
    const eliminada = await Playlist.findByIdAndDelete(id);
    if (!eliminada) {
      return res.status(404).json({ error: "Playlist no encontrada" });
    }
    res.json({ message: "Playlist eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar playlist:", error);
    res.status(500).json({ error: "Error al eliminar la playlist" });
  }
};

exports.actualizarPlaylist = async (req, res) => {
  const { id, nombre, perfilesAsociados } = req.body;

  if (!id || !nombre || !perfilesAsociados) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    const playlist = await Playlist.findById(id);
    if (!playlist) return res.status(404).json({ error: "Playlist no encontrada" });

    playlist.nombre = nombre;
    playlist.perfilesAsociados = perfilesAsociados;

    await playlist.save();
    res.json({ message: "Playlist actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar playlist:", error);
    res.status(500).json({ error: "Error al actualizar playlist" });
  }
};

exports.obtenerPlaylistPorId = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "El ID de la playlist es requerido" });
  }

  try {
    const playlist = await Playlist.findById(id).populate("perfilesAsociados");

    if (!playlist) {
      return res.status(404).json({ error: "Playlist no encontrada" });
    }

    res.status(200).json(playlist);
  } catch (error) {
    console.error("Error al obtener la playlist:", error);
    res.status(500).json({ error: "Error al obtener la playlist" });
  }
};

exports.obtenerPlaylistsPorPerfil = async (req, res) => {
  const { perfilId } = req.body;

  if (!perfilId) {
    return res.status(400).json({ error: "perfilId es requerido" });
  }

  try {
    // Filtrar playlists asociadas al perfil
    const playlists = await Playlist.find({ perfilesAsociados: perfilId }).populate('perfilesAsociados');

    // Agregar conteo de videos para cada playlist
    const conConteoVideos = await Promise.all(
      playlists.map(async (pl) => {
        const conteo = await Video.countDocuments({ playlistId: pl._id });
        return { ...pl.toObject(), cantidadVideos: conteo };
      })
    );

    res.json(conConteoVideos);
  } catch (error) {
    console.error("Error al obtener playlists:", error);
    res.status(500).json({ error: "Error al obtener playlists" });
  }
};

exports.obtenerPerfilesAsociados = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "ID de la playlist es requerido" });
  }

  try {
    const playlist = await Playlist.findById(id).populate("perfilesAsociados");
    if (!playlist) {
      return res.status(404).json({ error: "Playlist no encontrada" });
    }

    res.status(200).json({ perfiles: playlist.perfilesAsociados });
  } catch (error) {
    console.error("Error al obtener perfiles asociados:", error);
    res.status(500).json({ error: "Error al obtener los perfiles asociados" });
  }
};
