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
  const usuarioId = req.headers["usuario-id"];
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
    res.status(500).json({ error: "Error al obtener playlists" });
  }
};

exports.eliminarPlaylist = async (req, res) => {
  const { id } = req.params;
  try {
    await Video.deleteMany({ playlistId: id }); // eliminar videos asociados
    await Playlist.findByIdAndDelete(id);
    res.json({ message: "Playlist eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar playlist" });
  }
};

exports.actualizarPlaylist = async (req, res) => {
  const { id } = req.params;
  const { nombre, perfilesAsociados } = req.body;

  if (!nombre || !perfilesAsociados || perfilesAsociados.length === 0) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  try {
    const actualizada = await Playlist.findByIdAndUpdate(id, { nombre, perfilesAsociados }, { new: true });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar playlist" });
  }
};

exports.obtenerPlaylistPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const playlist = await Playlist.findById(id).populate('perfilesAsociados');
    if (!playlist) {
      return res.status(404).json({ error: "Playlist no encontrada" });
    }
    res.json(playlist);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la playlist" });
  }
};

exports.obtenerPlaylistsPorPerfil = async (req, res) => {
  try {
    const perfilId = req.params.perfilId;

    // Buscar playlists que incluyan este perfil en perfilesAsociados
    const playlists = await Playlist.find({ perfilesAsociados: perfilId });

    res.json(playlists);
  } catch (error) {
    console.error("Error al obtener playlists por perfil:", error);
    res.status(500).json({ message: "Error al obtener las playlists" });
  }
};