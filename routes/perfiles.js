const express = require("express");
const router = express.Router();

const {
  crearPerfil,
  obtenerPerfiles,
  actualizarPerfil,
  eliminarPerfil,
} = require("../controllers/perfilesController");

// Rutas para perfiles
router.post("/", crearPerfil); // Crear un perfil
router.get("/", obtenerPerfiles); // Obtener perfiles de un usuario
router.put("/", actualizarPerfil); // Actualizar un perfil
router.delete("/", eliminarPerfil); // Eliminar un perfil

module.exports = router;