const jwt = require("jsonwebtoken");

const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token no proporcionado o inválido" });
  }

  const token = authHeader.split(" ")[1]; // Sacamos el token después de "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // Agregamos los datos del usuario a la request
    next(); // Todo bien, continúa
  } catch (error) {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
};

module.exports = verificarToken;
