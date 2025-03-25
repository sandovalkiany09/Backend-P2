const express = require('express');
const router = express.Router();
const controller = require('../controllers/playlistController');

router.post('/', controller.crearPlaylist);
router.get('/', controller.obtenerPlaylists);
router.put('/:id', controller.actualizarPlaylist);
router.delete('/:id', controller.eliminarPlaylist);
router.get('/:id', controller.obtenerPlaylistPorId);
router.get('/perfil/:perfilId', controller.obtenerPlaylistsPorPerfil);

module.exports = router;
