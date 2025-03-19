const express = require("express");
const router = express.Router();

const { 
    registroPost,
    registroGet,
    registroUpdate,
    registroDelete,
    loginPost,
    validarPin

} = require("../controllers/usuariosController");


router.post("/", registroPost);
router.get("/", registroGet);
router.put("/", registroUpdate);
router.delete("/", registroDelete);
router.post("/", loginPost);
router.post("/validar-pin", validarPin)

module.exports = router;