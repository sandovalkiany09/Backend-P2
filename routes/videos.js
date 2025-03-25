const express = require('express');
const router = express.Router();
const controller = require('../controllers/videoController');

router.post('/', controller.agregarVideo);
router.get('/:playlistId', controller.obtenerVideosPorPlaylist);
router.get('/conteo/:playlistId', controller.contarVideosPorPlaylist);
router.put('/:id', controller.actualizarVideo);
router.delete('/:id', controller.eliminarVideo);
router.get('/uno/:id', controller.obtenerVideoPorId);

module.exports = router;
