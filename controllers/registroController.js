const Registro = require("../models/registroModel");
const moment = require("moment"); // Usamos moment para calcular la edad

/**
 * Crea un nuevo registro de usuario
 *
 * @param {*} req
 * @param {*} res
 */
const registroPost = async (req, res) => {
  const { correo, contrasenia, telefono, pin, nombre, apellidos, pais, fechaNacimiento } = req.body;

  // Validación de campos vacíos
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

module.exports = {
  registroPost
};

