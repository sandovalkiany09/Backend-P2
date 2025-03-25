const Video = require('../models/videoModel');

exports.agregarVideo = async (req, res) => {
  const { playlistId, nombre, url, descripcion } = req.body;

  if (!playlistId || !nombre || !url) {
    return res.status(400).json({ error: "Nombre, URL y playlist son obligatorios" });
  }

  try {
    const nuevoVideo = new Video({ playlistId, nombre, url, descripcion });
    const guardado = await nuevoVideo.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(500).json({ error: "Error al guardar video" });
  }
};

exports.obtenerVideosPorPlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const videos = await Video.find({ playlistId });
    res.json(videos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener videos" });
  }
};

exports.contarVideosPorPlaylist = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const totalVideos = await Video.countDocuments({ playlistId });
    res.status(200).json({ total: totalVideos });
  } catch (error) {
    console.error("Error al contar videos:", error);
    res.status(500).json({ error: "Error al contar videos" });
  }
};

exports.eliminarVideo = async (req, res) => {
  const { id } = req.params;
  try {
    await Video.findByIdAndDelete(id);
    res.json({ message: "Video eliminado" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar video" });
  }
};

exports.actualizarVideo = async (req, res) => {
  const { id } = req.params;
  const { nombre, url, descripcion } = req.body;

  if (!nombre || !url) {
    return res.status(400).json({ error: "Nombre y URL son obligatorios" });
  }

  try {
    const actualizado = await Video.findByIdAndUpdate(id, { nombre, url, descripcion }, { new: true });
    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar video" });
  }
};

exports.obtenerVideoPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ error: "Video no encontrado" });
    }
    res.json(video);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el video" });
  }
};

