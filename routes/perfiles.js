const express = require("express");
const router = express.Router();

const {
  crearPerfil,
  obtenerPerfiles,
  actualizarPerfil,
  eliminarPerfil,
  validarNombreYPin,
  validarPinYGenerarToken
} = require("../controllers/perfilesController");

const authMiddleware = require("../middlewares/authMiddleware");

// Rutas para perfiles
router.post("/",authMiddleware ,crearPerfil); // Crear un perfil
router.get("/", authMiddleware, obtenerPerfiles); // Obtener perfiles de un usuario
router.put("/", authMiddleware, actualizarPerfil); // Actualizar un perfil
router.delete("/",authMiddleware, eliminarPerfil); // Eliminar un perfil
router.post("/validar", authMiddleware, validarNombreYPin); // Validar nombre y PIN
router.post("/validar-pin", validarPinYGenerarToken);

module.exports = router;