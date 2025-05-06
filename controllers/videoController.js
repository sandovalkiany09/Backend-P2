const axios = require('axios');
const Video = require('../models/videoModel');
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

exports.buscarVideosYouTube = async (req, res) => {
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: "Falta el término de búsqueda" });

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=10&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await axios.get(apiUrl);
    const resultados = response.data.items.map(item => ({
      videoId: item.id.videoId,
      titulo: item.snippet.title,
      descripcion: item.snippet.description,
      thumbnail: item.snippet.thumbnails.default.url,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    res.json(resultados);
  } catch (error) {
    console.error("Error al buscar videos:", error.message);
    res.status(500).json({ error: "Error al buscar videos en YouTube" });
  }
};

exports.agregarVideo = async (req, res) => {
  const { playlistId, nombre, url, descripcion } = req.body;

  if (!playlistId || !url) {
    return res.status(400).json({ error: "URL y playlist son obligatorios" });
  }

  let finalNombre = nombre;
  let finalDescripcion = descripcion;

  // Si no se proporciona nombre o descripción, se intenta obtener desde YouTube
  if (!nombre || !descripcion) {
    const videoData = await exports.getYouTubeVideoData(url, YOUTUBE_API_KEY);

    if (!videoData) {
      return res.status(400).json({ error: "No se pudo obtener información del video de YouTube" });
    }

    if (!finalNombre) finalNombre = videoData.nombre;
    if (!finalDescripcion) finalDescripcion = videoData.descripcion;
  }

  try {
    const nuevoVideo = new Video({ playlistId, nombre: finalNombre, url, descripcion: finalDescripcion });
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



