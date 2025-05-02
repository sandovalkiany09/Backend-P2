const express = require('express');
const router = express.Router();
const controller = require('../controllers/playlistController');

const authMiddleware = require("../middlewares/authMiddleware");

router.post('/', authMiddleware, controller.crearPlaylist);
router.get('/', authMiddleware, controller.obtenerPlaylists);
router.put('/', authMiddleware, controller.actualizarPlaylist);
router.delete('/', authMiddleware, controller.eliminarPlaylist);
router.post('/detalles', authMiddleware, controller.obtenerPlaylistPorId);
router.post('/perfilId', authMiddleware, controller.obtenerPlaylistsPorPerfil);
router.post('/perfiles-asociados', authMiddleware, controller.obtenerPerfilesAsociados);


module.exports = router;
