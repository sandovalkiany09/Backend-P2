const Registro = require("../models/usuariosModel");
const moment = require("moment"); // Usamos moment para calcular la edad
const jwt = require("jsonwebtoken");

/**
 * Maneja el registro de un nuevo usuario o redirige al login si es una solicitud de inicio de sesión.
 *
 * @param {*} req
 * @param {*} res
 */
const registroPost = async (req, res) => {
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
  const nuevoRegistro = new Registro({
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
    const registroGuardado = await nuevoRegistro.save();
    res.status(201).json({
      message: 'Usuario registrado correctamente',
      data: registroGuardado
    });
  } catch (err) {
    console.error('Error al guardar el usuario:', err);
    res.status(500).json({
      error: 'Hubo un error al registrar el usuario'
    });
  }
};

/**
 * Mostrar el usuario registrado o registrados
 *
 * @param {*} req
 * @param {*} res
 */
const registroGet = (req, res) => {
    // Si se pasa un ID específico en la query
    if (req.query && req.query.id) {
      Registro.findById(req.query.id)
        .then((registro) => {
          if (!registro) {
            return res.status(404).json({ error: "Registro no encontrado" });
          }
          res.json(registro);
        })
        .catch((err) => {
          res.status(404);
          console.log("Error al buscar el registro", err);
          res.json({ error: "Error al obtener el registro" });
        });
    } else {
      // Si no se pasa un ID, se obtienen todos los registros
      Registro.find()
        .then((registros) => {
          res.json(registros);
        })
        .catch((err) => {
          res.status(422);
          res.json({ error: err });
        });
    }
};

/**
 * Actualiza un registro de usuario existente
 *
 * @param {*} req
 * @param {*} res
 */
const registroUpdate = async (req, res) => {
  if (req.query && req.query.id) {
      const { id } = req.query;
      const { correo, contrasenia, telefono, pin, nombre, apellidos, pais, fechaNacimiento } = req.body;

      try {
          const registro = await Registro.findById(id);
          if (!registro) {
              return res.status(404).json({ error: "Registro no encontrado" });
          }

          // Actualizar solo los campos proporcionados
          if (correo) registro.correo = correo;
          if (contrasenia) registro.contrasenia = contrasenia;
          if (telefono) registro.telefono = telefono;
          if (pin) registro.pin = pin;
          if (nombre) registro.nombre = nombre;
          if (apellidos) registro.apellidos = apellidos;
          if (pais) registro.pais = pais;
          if (fechaNacimiento) registro.fechaNacimiento = fechaNacimiento;

          const registroActualizado = await registro.save();
          res.json({
              message: 'Registro actualizado correctamente',
              data: registroActualizado
          });
      } catch (err) {
          console.error('Error al actualizar el registro:', err);
          res.status(500).json({ error: 'Hubo un error al actualizar el registro' });
      }
  } else {
      res.status(400).json({ error: "Se requiere un ID para actualizar el registro" });
  }
};

/**
 * Elimina un registro de usuario existente
 *
 * @param {*} req
 * @param {*} res
 */
const registroDelete = async (req, res) => {
  if (req.query && req.query.id) {
      const { id } = req.query;

      try {
          const registro = await Registro.findByIdAndDelete(id);
          if (!registro) {
              return res.status(404).json({ error: "Registro no encontrado" });
          }

          res.json({ message: 'Registro eliminado correctamente' });
      } catch (err) {
          console.error('Error al eliminar el registro:', err);
          res.status(500).json({ error: 'Hubo un error al eliminar el registro' });
      }
  } else {
      res.status(400).json({ error: "Se requiere un ID para eliminar el registro" });
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
    const usuario = await Registro.findOne({ correo });

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
      const usuario = await Registro.findById(id);

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
  registroPost,
  registroGet,
  registroUpdate,
  registroDelete,
  validarPin,
  loginPost
};