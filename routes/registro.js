const express = require("express");
const router = express.Router();
const { registroPost } = require("../controllers/registroController");

// Solo incluir la ruta POST para probar
router.post("/", registroPost);

module.exports = router;

