const express = require("express");
const router = express.Router();

const {
  crearPerfil,
  obtenerPerfiles,
  actualizarPerfil,
  eliminarPerfil,
  validarNombreYPin
} = require("../controllers/perfilesController");

// Rutas para perfiles
router.post("/", crearPerfil); // Crear un perfil
router.get("/obtener", obtenerPerfiles); // Obtener perfiles de un usuario
router.put("/actualizar", actualizarPerfil); // Actualizar un perfil
router.delete("/eliminar", eliminarPerfil); // Eliminar un perfil
router.post("/validar", validarNombreYPin); // Validar nombre y PIN

module.exports = router;