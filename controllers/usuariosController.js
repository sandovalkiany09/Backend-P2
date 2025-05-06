const Usuario = require("../models/usuariosModel");
const moment = require("moment"); // Usamos moment para calcular la edad
const jwt = require("jsonwebtoken");
const axios = require('axios'); // Usamos axios para interactuar con la API de MailerSend
const { MAILERSEND_API_KEY } = process.env; // Cargar la clave API desde el archivo .env
const twilio = require('twilio');
const { TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { OAuth2Client } = require('google-auth-library');
const clientGoogle = new OAuth2Client(process.env.CLIENT_ID);
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

// Función para generar un código aleatorio de 6 dígitos
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000); // Genera un código de 6 dígitos
}

// Enviar el código de verificación por SMS
const sendVerificationSMS = async (telefono, code) => {
  try {
    await client.messages.create({
      body: `KidstTube - Tu código de verificación es: ${code}`,
      from: TWILIO_PHONE_NUMBER,
      to: telefono,
    });
    console.log('SMS enviado');
  } catch (err) {
    console.error('Error al enviar SMS:', err);
  }
};

/**
 * Maneja el registro de un nuevo usuario o redirige al login si es una solicitud de inicio de sesión.
 *
 * @param {*} req
 * @param {*} res
 */
// Función para enviar el correo de verificación
const sendVerificationEmail = async (email, userId) => {
  const verificationToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const mailerSendApiUrl = 'https://api.mailersend.com/v1/email'; // Endpoint de la API

 // Configuración del cuerpo de la solicitud
const emailData = {
  from: { email: "no-reply@test-zxk54v88rq1ljy6v.mlsender.net", name: "KidsTube" }, // Dirección de envío
  to: [{ email: email, name: "Usuario" }], // Destinatario
  subject: "Verifica tu correo electrónico", // Asunto
  html: `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
          }
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header img {
            width: 50px;
            margin-bottom: 10px;
          }
          .header h1 {
            color: #ff5c8d;
            font-size: 32px;
            margin: 0;
          }
          .content {
            font-size: 16px;
            line-height: 1.5;
            color: #333;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background-color: #ff5c8d;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
            margin-top: 20px;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #aaa;
            margin-top: 30px;
          }
          .footer a {
            color: #ff5c8d;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://cdn.pixabay.com/photo/2020/11/01/04/21/youtube-5702837_1280.png" alt="KidsTube Logo">
            <h1>¡Bienvenido a KidsTube!</h1>
          </div>
          <div class="content">
            <p>Hola ${email},</p>
            <p>¡Gracias por registrarte en KidsTube! Para completar tu registro y verificar tu cuenta, por favor, haz clic en el siguiente botón:</p>
            <a href="http://127.0.0.1:5501/Frontend-P2-main/src/verificar.html?token=${verificationToken}" class="button">Verificar Correo</a>
            <p>Si no has solicitado esta verificación, por favor ignora este correo.</p>
          </div>
          <div class="footer">
            <p>Si tienes alguna pregunta, no dudes en <a href="mailto:support@kidstube.com">contactarnos</a>.</p>
            <p>© 2025 KidsTube. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
    </html>
  `,
  text: `Hola ${email},\n\n¡Gracias por registrarte en KidsTube! Para completar tu registro y verificar tu cuenta, por favor, haz clic en el siguiente enlace:\n\nhttp://127.0.0.1:5500/client/src/verificar.html?token=${verificationToken}\n\nSi no has solicitado esta verificación, por favor ignora este correo.\n\n© 2025 KidsTube. Todos los derechos reservados.`
};

  // Configuración para la API de MailerSend
  const config = {
    headers: {
      'Authorization': `Bearer ${MAILERSEND_API_KEY}`, // La API Key
      'Content-Type': 'application/json' // Indicamos que el cuerpo de la solicitud es JSON
    }
  };

  try {
    // Realizamos la solicitud POST a la API de MailerSend
    const response = await axios.post(mailerSendApiUrl, emailData, config);
    console.log('Correo de verificación enviado:', response.data);
  } catch (err) {
    console.error("Error al enviar el correo de verificación:", err.response ? err.response.data : err.message);
  }
};

// Función para manejar el registro de usuario
const usuarioPost = async (req, res) => {
  const { correo, contrasenia, telefono, pin, nombre, apellidos, pais, fechaNacimiento } = req.body;

  // Verificar si es una solicitud de login (si los datos de teléfono y pin están vacíos, lo redirige al login)
  if (!telefono && !pin && !nombre && !apellidos && !pais && !fechaNacimiento) {
    return loginPost(req, res); // Redirigir al controlador de login
  }

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

  // Validación de la fecha de nacimiento
  const fechaFormato = moment(fechaNacimiento, "DD-MM-YYYY", true);
  if (!fechaFormato.isValid()) {
    return res.status(400).json({
      error: 'La fecha de nacimiento debe tener el formato DD-MM-YYYY'
    });
  }

  // Validación de la edad (el usuario debe ser mayor de 18 años)
  const edad = moment().diff(fechaFormato, 'years');
  if (edad < 18) {
    return res.status(400).json({
      error: 'Debe ser mayor de 18 años para registrarse'
    });
  }

  // Crear un nuevo registro en la base de datos
  const nuevoUsuario = new Usuario({
    correo,
    contrasenia,
    telefono,
    pin,
    nombre,
    apellidos,
    pais,
    fechaNacimiento: fechaFormato.format("YYYY-MM-DD"), // Guardamos la fecha en formato estándar
    estado: 'pendiente' // El estado inicial del usuario es 'pendiente'
  });

  // Guardar el nuevo registro en la base de datos
  try {
    const usuarioGuardado = await nuevoUsuario.save();

    // Enviar el correo de verificación
    await sendVerificationEmail(correo, usuarioGuardado._id);

    res.status(201).json({
      message: 'Usuario registrado correctamente, revisa tu correo para verificar tu cuenta',
      data: usuarioGuardado
    });
  } catch (err) {
    console.error('Error al guardar el usuario:', err);
    res.status(500).json({
      error: 'Hubo un error al registrar el usuario'
    });
  }
};

// Función para verificar el token y activar el usuario
const verifyUser = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const usuario = await Usuario.findById(userId);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.estado === 'activo') {
      return res.status(400).json({ error: 'La cuenta ya está activa.' });
    }

    usuario.estado = 'activo';
    await usuario.save();

    res.status(200).json({ message: 'Cuenta verificada y activada correctamente. Ahora puedes iniciar sesión.' });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return res.status(400).json({ error: 'El token ha expirado. Por favor, solicita uno nuevo.' });
    }

    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Token inválido. Por favor, verifica el enlace.' });
    }

    console.error("Error al verificar el usuario:", err);
    res.status(500).json({ error: 'Hubo un error al verificar el usuario' });
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

    // Comparación simple de contraseñas (sin hash)
    if (usuario.contrasenia !== contrasenia) {
      return res.status(401).json({
        error: "Contraseña incorrecta",
      });
    }

    // Verificar si el estado del usuario es 'pendiente'
    if (usuario.estado === 'pendiente') {
      return res.status(400).json({
        error: "Tu cuenta está pendiente de verificación. Por favor, verifica tu correo primero.",
      });
    }

    // Generar el código de verificación de 6 dígitos
    const verificationCode = generateVerificationCode();

    // Guardar el código de verificación en la base de datos temporalmente
    usuario.verificationCode = verificationCode;
    await usuario.save();

    // Enviar el SMS con el código de verificación
    await sendVerificationSMS(usuario.telefono, verificationCode);

    // Crear token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        correo: usuario.correo,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN } // Asegúrate de tener el valor adecuado en tu archivo .env
    );

    // Devolver token y datos del usuario
    res.status(200).json({
      message: "Usuario autenticado, se ha enviado un código de verificación por SMS",
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

// Función para verificar el código de verificación
const verifyCodePost = async (req, res) => {
  const { verificationCode } = req.body;

  // Asegúrate de que el token esté presente en la cabecera
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    // Verifica si el código de verificación coincide
    if (usuario.verificationCode !== verificationCode) {
      return res.status(400).json({ error: 'Código de verificación incorrecto' });
    }

    // Si todo es correcto, activa la cuenta
    usuario.estado = 'activo';
    usuario.verificationCode = undefined; // Limpiar el código de verificación
    await usuario.save();

    res.status(200).json({ message: 'Cuenta verificada correctamente' });
  } catch (err) {
    console.error('Error al verificar el código:', err);
    res.status(500).json({ error: 'Hubo un error al verificar el código' });
  }
};

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google", // URL de callback de Google
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      user = new User({
        googleId: profile.id,
        email: profile.emails[0].value,  // Usamos el email de Google
        name: profile.displayName,
        imageUrl: profile.photos[0].value,  // Usamos la foto de Google
      });
      await user.save();
    }

    // Serialización del usuario para la sesión
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// Función para manejar el callback de Google
const googleCallback = async (req, res) => {
  const { id_token } = req.body;

  try {
    const ticket = await clientGoogle.verifyIdToken({
      idToken: id_token,
      audience: process.env.CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const imageUrl = payload.picture;

    let user = await Usuario.findOne({ googleId });

    if (!user) {
      user = new Usuario({
        googleId,
        email,
        name,
        imageUrl,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error al verificar el token de Google:', error);
    res.status(400).json({ error: 'Error al autenticar con Google.' });
  }
};

const googleTokenHandler = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: 'Credencial de Google no proporcionada' });
    }

    // Verificar token con Google
    const ticket = await clientGoogle.verifyIdToken({
      idToken: credential,
      audience: process.env.CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.given_name || payload.name;
    const familyName = payload.family_name || '';
    const picture = payload.picture || '';

    // Buscar usuario existente
    let user = await Usuario.findOne({ 
      $or: [
        { googleId },
        { correo: email }
      ]
    });

    const isNewUser = !user;

    if (!user) {
      // Crear nuevo usuario sin campos obligatorios tradicionales
      user = new Usuario({
        googleId,
        correo: email,
        nombre: name,
        apellidos: familyName,
        imagen: picture,
        estado: 'pendiente',
        metodoRegistro: 'google',
        registroCompleto: false
      });
      
      await user.save();
    } else if (!user.googleId) {
      // Actualizar usuario existente con googleId
      user.googleId = googleId;
      user.metodoRegistro = 'google';
      await user.save();
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.correo,
        nombre: user.nombre,
        registroCompleto: user.registroCompleto
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
    
    res.json({ 
      success: true,
      token, 
      isNewUser,
      registroCompleto: user.registroCompleto,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.correo,
        imagen: user.imagen
      }
    });

  } catch (error) {
    console.error('Error en autenticación Google:', error);
    
    // Manejo específico de errores de validación
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Error de validación',
        details: errors
      });
    }
    
    res.status(500).json({ 
      error: 'Error en autenticación con Google',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const completeGoogleRegistration = async (req, res) => {
  try {
    const { googleId, email, nombre, imagen, telefono, fechaNacimiento, direccion, pais } = req.body;

    // Validaciones básicas
    if (!googleId || !email) {
      return res.status(400).json({ 
        success: false,
        error: 'Datos de Google incompletos' 
      });
    }

    if (!telefono || !fechaNacimiento) {
      return res.status(400).json({ 
        success: false,
        error: 'Teléfono y fecha de nacimiento son obligatorios' 
      });
    }

    // Validar formato de teléfono
    if (!/^[0-9]{10,15}$/.test(telefono)) {
      return res.status(400).json({ 
        success: false,
        error: 'Formato de teléfono no válido (solo números, 10-15 dígitos)' 
      });
    }

    // Validar fecha
    const fechaMoment = moment(fechaNacimiento, "YYYY-MM-DD", true);
    if (!fechaMoment.isValid()) {
      return res.status(400).json({ 
        success: false,
        error: 'Formato de fecha no válido. Use YYYY-MM-DD' 
      });
    }

    // Calcular edad
    const edad = moment().diff(fechaMoment, 'years');
    if (edad < 18) {
      return res.status(400).json({ 
        success: false,
        error: 'Debes ser mayor de 18 años para registrarte' 
      });
    }

    // Buscar o crear usuario
    let usuario = await Usuario.findOneAndUpdate(
      { googleId },
      {
        telefono,
        fechaNacimiento: fechaMoment.toDate(),
        direccion: direccion || '',
        pais: pais || '',
        estado: 'activo',
        registroCompleto: true,
        nombre: nombre || '',
        imagen: imagen || '',
        correo: email
      },
      { new: true, upsert: true, select: '-contrasenia -pin -verificationCode' }
    );

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id, 
        email: usuario.correo,
        nombre: usuario.nombre,
        registroCompleto: true
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Respuesta exitosa
    res.json({ 
      success: true,
      token,
      redirectTo: 'index.html', // Especificamos a dónde redirigir
      message: 'Registro completado exitosamente'
    });

  } catch (error) {
    console.error('Error al completar registro:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al completar registro',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  usuarioPost,
  usuarioPostId,
  usuarioGet,
  usuarioUpdate,
  usuarioDelete,
  validarPin,
  loginPost,
  verifyUser,
  verifyCodePost,
  googleCallback,
  googleTokenHandler,
  completeGoogleRegistration
};