require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

// Configurar CORS
app.use(cors({ domains: "*", methods: "*" }));

// Middleware para parsear JSON
app.use(bodyParser.json());

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
app.use("/registro", registroRoutes);
app.use("/perfiles", perfilesRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));