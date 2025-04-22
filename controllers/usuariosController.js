const Usuario = require("../models/usuariosModel");
const moment = require("moment"); // Usamos moment para calcular la edad
const jwt = require("jsonwebtoken");

/**
 * Maneja el registro de un nuevo usuario o redirige al login si es una solicitud de inicio de sesión.
 *
 * @param {*} req
 * @param {*} res
 */
const usuarioPost = async (req, res) => {
  const { correo, contrasenia, telefono, pin, nombre, apellidos, pais, fechaNacimiento } = req.body;

  // Verificar si es una solicitud de login
  if (!telefono && !pin && !nombre && !apellidos && !pais && !fechaNacimiento) {
    return loginPost(req, res); // Redirigir al controlador de login
  }

  // Validación de campos vacíos (solo para registro)
  if (!correo || !contrasenia || !telefono || !pin || !nombre || !apellidos || !fechaNacimiento) {
    return res.status(400).json({
      error: 'Todos los campos son obligatorios'
    });
  }

  // Validación de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({
      error: 'El correo electrónico no es válido'
    });
  }

  // Validación de que el pin tenga exactamente 6 dígitos
  if (!/^\d{6}$/.test(pin)) {
    return res.status(400).json({
      error: 'El pin debe tener exactamente 6 dígitos numéricos'
    });
  }

  // Validación de la fecha de nacimiento (formato DD-MM-YYYY)
  const fechaFormato = moment(fechaNacimiento, "DD-MM-YYYY", true);
  if (!fechaFormato.isValid()) {
    return res.status(400).json({
      error: 'La fecha de nacimiento debe tener el formato DD-MM-YYYY'
    });
  }

  // Validación de la edad (mayor de 18 años)
  const edad = moment().diff(fechaFormato, 'years');
  if (edad < 18) {
    return res.status(400).json({
      error: 'Debe ser mayor de 18 años para registrarse'
    });
  }

  // Crear un nuevo registro
  const nuevoUsuario = new Usuario({
    correo,
    contrasenia,
    telefono,
    pin,
    nombre,
    apellidos,
    pais,
    fechaNacimiento: fechaFormato.format("YYYY-MM-DD") // Guardamos la fecha en formato estándar
  });

  // Guardar el nuevo registro en la base de datos
  try {
    const usuarioGuardado = await nuevoUsuario.save();
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      data: usuarioGuardado
    });
  } catch (err) {
    console.error('Error al guardar el usuario:', err);
    res.status(500).json({
      error: 'Hubo un error al registrar el usuario'
    });
  }
};

/**
 * Mostrar usuarios registrados
 *
 * @param {*} req
 * @param {*} res
 */
const usuarioGet = async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.json(usuarios);
  } catch (err) {
    console.error("Error al obtener los usuarios:", err);
    res.status(500).json({ error: "Hubo un error al obtener los usuarios" });
  }
};

/**
 * Mostrar usuario con Id específico
 *
 * @param {*} req
 * @param {*} res
 */
const usuarioPostId = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: "El ID es obligatorio" });
  }

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (err) {
    console.error("Error al buscar el registro:", err);
    res.status(500).json({ error: "Error al obtener el registro" });
  }
};


/**
 * Actualiza un registro de usuario existente
 *
 * @param {*} req
 * @param {*} res
 */
const usuarioUpdate = async (req, res) => {
  const { id, correo, contrasenia, telefono, pin, nombre, apellidos, pais, fechaNacimiento } = req.body;

  // Validar que se reciba el ID
  if (!id) {
    return res.status(400).json({ error: "Se requiere un ID para actualizar el usuario" });
  }

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Actualizar solo los campos proporcionados
    if (correo) usuario.correo = correo;
    if (contrasenia) usuario.contrasenia = contrasenia;
    if (telefono) usuario.telefono = telefono;
    if (pin) usuario.pin = pin;
    if (nombre) usuario.nombre = nombre;
    if (apellidos) usuario.apellidos = apellidos;
    if (pais) usuario.pais = pais;
    if (fechaNacimiento) usuario.fechaNacimiento = fechaNacimiento;

    const usuarioActualizado = await usuario.save();

    res.json({
      message: 'Usuario actualizado correctamente',
      data: usuarioActualizado
    });
  } catch (err) {
    console.error('Error al actualizar el usuario:', err);
    res.status(500).json({ error: 'Hubo un error al actualizar el usuario' });
  }
};


/**
 * Elimina un registro de usuario existente
 *
 * @param {*} req
 * @param {*} res
 */
const usuarioDelete = async (req, res) => {
  if (req.query && req.query.id) {
      const { id } = req.query;

      try {
          const usuario = await Usuario.findByIdAndDelete(id);
          if (!usuario) {
              return res.status(404).json({ error: "Registro no encontrado" });
          }

          res.json({ message: 'Usuario eliminado correctamente' });
      } catch (err) {
          console.error('Error al eliminar el usuario:', err);
          res.status(500).json({ error: 'Hubo un error al eliminar el usuario' });
      }
  } else {
      res.status(400).json({ error: "Se requiere un ID para eliminar el usuario" });
  }
};

/**
 * Maneja el inicio de sesión de un usuario.
 *
 * @param {*} req
 * @param {*} res
 */
const loginPost = async (req, res) => {
  const { correo, contrasenia } = req.body;

  // Validación de campos vacíos
  if (!correo || !contrasenia) {
    return res.status(400).json({
      error: "El correo y la contraseña son obligatorios",
    });
  }

  // Validación de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({
      error: "El correo electrónico no es válido",
    });
  }

  try {
    // Buscar al usuario por su correo
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    // Verificar si la contraseña coincide
    if (usuario.contrasenia !== contrasenia) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    // Crear token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        correo: usuario.correo,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Devolver token y datos del usuario
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  } catch (err) {
    console.error("Error al autenticar al usuario:", err);
    res.status(500).json({
      error: "Hubo un error al intentar iniciar sesión",
    });
  }
};


/**
 * Valida el PIN de un usuario
 *
 * @param {*} req
 * @param {*} res
 */
const validarPin = async (req, res) => {
  const { id, pin } = req.body;

  // Validación de datos
  if (!id || !pin) {
      return res.status(400).json({ error: "El ID del usuario y el PIN son obligatorios" });
  }

  try {
      // Buscar el usuario por ObjectId
      const usuario = await Usuario.findById(id);

      if (!usuario) {
          return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Validar el PIN
      if (String(usuario.pin).trim().localeCompare(String(pin).trim()) !== 0) {
          return res.status(401).json({ error: "PIN incorrecto" });
      }

      res.json({ message: "PIN válido" });
  } catch (error) {
      console.error("Error al validar el PIN:", error);
      res.status(500).json({ error: "Hubo un error al validar el PIN" });
  }
};


module.exports = {
  usuarioPost,
  usuarioPostId,
  usuarioGet,
  usuarioUpdate,
  usuarioDelete,
  validarPin,
  loginPost
};