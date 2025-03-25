const express = require('express');
const router = express.Router();
const buscarController = require('../controllers/buscarController');

router.get('/perfil/:perfilId', buscarController.buscarVideosPorPerfil);

module.exports = router;