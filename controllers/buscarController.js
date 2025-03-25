const Playlist = require('../models/playlistModel');
const Video = require('../models/videoModel');

/**
 * Busca videos en las playlists de un perfil específico
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.buscarVideosPorPerfil = async (req, res) => {
    const { perfilId } = req.params;
    const { query } = req.query; 

    try {
        // 1. Validar parámetros
        if (!perfilId || !query) {
            return res.status(400).json({ 
                error: "Se requiere perfilId y término de búsqueda" 
            });
        }

        // 2. Obtener playlists asociadas al perfil
        const playlists = await Playlist.find({ 
            perfilesAsociados: perfilId 
        }).select('_id nombre');

        if (playlists.length === 0) {
            return res.json([]); // No hay playlists para buscar
        }

        // 3. Buscar videos que coincidan en nombre o descripción
        const videos = await Video.find({
            playlistId: { $in: playlists.map(p => p._id) },
            $or: [
                { nombre: { $regex: query, $options: 'i' } },
                { descripcion: { $regex: query, $options: 'i' } }
            ]
        }).lean();

        // 4. Enriquecer resultados con info de la playlist
        const resultados = videos.map(video => {
            const playlist = playlists.find(p => p._id.equals(video.playlistId));
            return {
                ...video,
                listaNombre: playlist.nombre,
                listaId: playlist._id
            };
        });

        res.json(resultados);
    } catch (error) {
        console.error("Error en búsqueda:", error);
        res.status(500).json({ 
            error: "Error al realizar la búsqueda" 
        });
    }
};