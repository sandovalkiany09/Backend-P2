require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const helmet = require('helmet');

const app = express();

//Para servir las imágenes desde el back
app.use('/img', express.static('img'));

// Configurar CORS
app.use(cors({ domains: "*", methods: "*" }));

// Middleware para parsear JSON
app.use(bodyParser.json());

// Modificar el encabezado CSP para permitir los recursos necesarios
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "script-src 'self' https://apis.google.com https://accounts.google.com https://www.gstatic.com 'unsafe-inline'; " +
    "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; " +
    "frame-src https://accounts.google.com; " +
    "connect-src 'self' http://localhost:3000 https://www.googleapis.com;"
  );
  next();
});

// Agregar el encabezado COOP para permitir interacciones entre orígenes
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Conectado a la base de datos");
  } catch (error) {
    console.error("Error en la conexión a MongoDB:", error);
    process.exit(1);
  }
};
connectDB();

// Importar rutas
const registroRoutes = require("./routes/registro");
const perfilesRoutes = require("./routes/perfiles");
const playlistRoutes = require("./routes/playlist");
const videosRoutes = require("./routes/videos");
const searchRoutes = require('./routes/buscar');

app.use('/buscar', searchRoutes);
app.use("/registro", registroRoutes);
app.use("/perfiles", perfilesRoutes);
app.use("/playlist", playlistRoutes);
app.use("/videos", videosRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
