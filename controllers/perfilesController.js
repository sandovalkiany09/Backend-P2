const Perfil = require("../models/perfilModel"); // Importa el modelo de perfiles
const Registro = require("../models/usuariosModel"); // Importa el modelo de usuarios

/**
 * Crea un perfil para un usuario si no existe.
 *
 * @param {*} req
 * @param {*} res
 */
const crearPerfil = async (req, res) => {
  const { usuarioId, nombre, pin, imagen } = req.body;

  // Validación de campos vacíos
  if (!usuarioId || !nombre || !pin || !imagen) {
    return res.status(400).json({
      error: "El ID del usuario, nombre, PIN y imagen son obligatorios",
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

    // Verificar si ya existe un perfil con el mismo nombre o PIN para el usuario
    const perfilExistente = await Perfil.findOne({ usuarioId, $or: [{ nombre }, { pin }] });
    if (perfilExistente) {
      return res.status(400).json({
        error: "Ya existe un perfil con ese nombre o PIN para este usuario",
      });
    }

    // Crear el perfil
    const nuevoPerfil = new Perfil({
      usuarioId,
      nombre,
      pin,
      imagen,
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
  const usuarioId = req.headers["usuario-id"]; 

  // Validación de datos vacíos
  if (!usuarioId) {
    return res.status(400).json({
      error: "El ID del usuario es obligatorio",
    });
  }

  try {
    // Buscar los perfiles asociados al usuarioId
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
 * Actualiza los datos de un perfil.
 *
 * @param {*} req
 * @param {*} res
 */
const actualizarPerfil = async (req, res) => {
  const { usuarioId, pinActual, nombre, pinNuevo, imagen } = req.body;

  // Validación de datos vacíos
  if (!usuarioId || !pinActual || !nombre) {
    return res.status(400).json({
      error: "El ID del usuario, PIN actual y nombre son obligatorios",
    });
  }

  try {
    // Buscar el perfil por usuarioId y PIN actual
    const perfil = await Perfil.findOne({ usuarioId, pin: pinActual });

    if (!perfil) {
      // Si no se encuentra el perfil
      return res.status(404).json({
        error: "PIN actual incorrecto o perfil no encontrado",
      });
    }

    // Actualizar los datos del perfil
    perfil.nombre = nombre;
    perfil.pin = pinNuevo || pinActual; // Si no se proporciona un PIN nuevo, se mantiene el actual
    perfil.imagen = imagen;

    // Guardar los cambios
    await perfil.save();

    res.json({
      success: true,
      message: "Perfil actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    res.status(500).json({
      error: "Hubo un error al actualizar el perfil",
    });
  }
};


/**
 * Elimina un perfil.
 *
 * @param {*} req
 * @param {*} res
 */
const eliminarPerfil = async (req, res) => {
  const { usuarioId, pin } = req.body;

  // Validación de datos vacíos
  if (!usuarioId || !pin) {
    return res.status(400).json({
      error: "El ID del usuario y el PIN son obligatorios",
    });
  }

  try {
    // Buscar y eliminar el perfil por usuarioId y PIN
    const perfilEliminado = await Perfil.findOneAndDelete({ usuarioId, pin });

    if (!perfilEliminado) {
      // Si no se encuentra el perfil
      return res.status(404).json({
        error: "PIN incorrecto o perfil no encontrado",
      });
    }

    // Si el perfil se eliminó correctamente
    res.json({
      success: true,
      message: "Perfil eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar el perfil:", error);
    res.status(500).json({
      error: "Hubo un error al eliminar el perfil",
    });
  }
};

/**
 * Valida si el nombre y el PIN ya existen para el perfil de un usuario.
 *
 * @param {*} req
 * @param {*} res
 */
const validarNombreYPin = async (req, res) => {
  const { usuarioId, nombre, pin } = req.body;

  // Validación de datos vacíos
  if (!usuarioId || !nombre || !pin) {
    return res.status(400).json({
      error: "El ID del usuario, nombre y PIN son obligatorios",
    });
  }

  try {
    // Verificar si ya existe un perfil con el mismo nombre o PIN para el usuario
    const perfilExistente = await Perfil.findOne({ usuarioId, $or: [{ nombre }, { pin }] });

    if (perfilExistente) {
      // Si ya existe un perfil con el mismo nombre o PIN
      return res.status(400).json({
        exists: true,
        message: "El nombre o el PIN ya existen para este usuario",
      });
    }

    // Si el nombre y el PIN son válidos
    res.json({
      exists: false,
      message: "El nombre y el PIN son válidos",
    });
  } catch (error) {
    console.error("Error al validar el nombre y PIN:", error);
    res.status(500).json({
      error: "Hubo un error al validar el nombre y el PIN",
    });
  }
};

module.exports = {
  crearPerfil,
  obtenerPerfiles,
  actualizarPerfil,
  eliminarPerfil,
  validarNombreYPin,
};