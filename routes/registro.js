const express = require("express");
const router = express.Router();

const { 
    usuarioPost,
    usuarioPostId,
    usuarioGet,
    usuarioUpdate,
    usuarioDelete,
    loginPost,
    validarPin,
    verifyUser,
    verifyCodePost

} = require("../controllers/usuariosController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/", usuarioPost);
router.post("/obtener", authMiddleware, usuarioPostId); 
router.get("/", authMiddleware, usuarioGet);
router.put("/", authMiddleware, usuarioUpdate);
router.delete("/", authMiddleware, usuarioDelete);
router.post("/login", loginPost);
router.post("/validar-pin", authMiddleware,  validarPin)
router.get("/verify/:token", verifyUser); // Ruta para verificar la cuenta
router.post("/verify-code", authMiddleware, verifyCodePost);

module.exports = router;