const Perfil = require("../models/perfilModel"); // Importa el modelo de perfiles
const Registro = require("../models/usuariosModel"); // Importa el modelo de usuarios

/**
 * Crea un perfil para un usuario si no existe.
 *
 * @param {*} req
 * @param {*} res
 */
const crearPerfil = async (req, res) => {
  const { usuarioId, nombre } = req.body;

  // Validación de campos vacíos
  if (!usuarioId || !nombre) {
    return res.status(400).json({
      error: "El ID del usuario y el nombre del perfil son obligatorios",
    });
  }

  try {
    // Verificar si el usuario existe
    const usuario = await Registro.findById(usuarioId);
    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Verificar si el perfil ya existe para este usuario
    const perfilExistente = await Perfil.findOne({ usuarioId, nombre });
    if (perfilExistente) {
      return res.status(400).json({
        error: "El perfil ya existe para este usuario",
      });
    }

    // Crear el perfil con una imagen por defecto
    const nuevoPerfil = new Perfil({
      usuarioId,
      nombre,
      imagen: "https://i.pinimg.com/736x/f9/1f/ba/f91fba046dd5208787a3ffa5c1f299e7.jpg"
    });

    // Guardar el perfil en la base de datos
    const perfilGuardado = await nuevoPerfil.save();
    res.status(201).json({
      message: "Perfil creado correctamente",
      data: perfilGuardado,
    });
  } catch (error) {
    console.error("Error al crear el perfil:", error);
    res.status(500).json({
      error: "Hubo un error al crear el perfil",
    });
  }
};

/**
 * Obtiene los perfiles de un usuario.
 *
 * @param {*} req
 * @param {*} res
 */
const obtenerPerfiles = async (req, res) => {
  const { usuarioId } = req.query;

  // Validación de campos vacíos
  if (!usuarioId) {
    return res.status(400).json({
      error: "El ID del usuario es obligatorio",
    });
  }

  try {
    // Buscar los perfiles del usuario
    const perfiles = await Perfil.find({ usuarioId });
    res.json(perfiles);
  } catch (error) {
    console.error("Error al obtener los perfiles:", error);
    res.status(500).json({
      error: "Hubo un error al obtener los perfiles",
    });
  }
};

/**
 * Actualiza un perfil existente.
 *
 * @param {*} req
 * @param {*} res
 */
const actualizarPerfil = async (req, res) => {
  const { id } = req.query;
  const { nombre, imagen } = req.body;

  // Validación de campos vacíos
  if (!id) {
    return res.status(400).json({
      error: "El ID del perfil es obligatorio",
    });
  }

  try {
    // Buscar el perfil por su ID
    const perfil = await Perfil.findById(id);
    if (!perfil) {
      return res.status(404).json({
        error: "Perfil no encontrado",
      });
    }

    // Actualizar los campos proporcionados
    if (nombre) perfil.nombre = nombre;
    if (imagen) perfil.imagen = imagen;

    // Guardar los cambios
    const perfilActualizado = await perfil.save();
    res.json({
      message: "Perfil actualizado correctamente",
      data: perfilActualizado,
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar el perfil",
    });
  }
};

/**
 * Elimina un perfil existente.
 *
 * @param {*} req
 * @param {*} res
 */
const eliminarPerfil = async (req, res) => {
  const { id } = req.query;

  // Validación de campos vacíos
  if (!id) {
    return res.status(400).json({
      error: "El ID del perfil es obligatorio",
    });
  }

  try {
    // Buscar y eliminar el perfil por su ID
    const perfilEliminado = await Perfil.findByIdAndDelete(id);
    if (!perfilEliminado) {
      return res.status(404).json({
        error: "Perfil no encontrado",
      });
    }

    res.json({
      message: "Perfil eliminado correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar el perfil:", error);
    res.status(500).json({
      error: "Hubo un error al eliminar el perfil",
    });
  }
};

module.exports = {
  crearPerfil,
  obtenerPerfiles,
  actualizarPerfil,
  eliminarPerfil,
};