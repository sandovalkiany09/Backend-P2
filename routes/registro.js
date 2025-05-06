const express = require("express");
const passport = require("passport");
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
    verifyCodePost,
    googleCallback,
    googleTokenHandler,
    completeGoogleRegistration

} = require("../controllers/usuariosController");
const authMiddleware = require("../middlewares/authMiddleware");

// Ruta para iniciar la autenticación con Google
router.get("/auth/google", passport.authenticate("google", {
    scope: ["profile", "email"],  // Solicitamos los permisos necesarios
  }));
  
  // Ruta de callback que maneja la respuesta de Google
  router.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "http://127.0.0.1:5501/Frontend-P2-main/src/index.html",  // Redirige al login si falla
  }), (req, res) => {
    // Si la autenticación es exitosa, genera un token JWT y redirige a la página de registro o dashboard
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,  // Usa el tiempo de expiración del JWT
    });
  
    // Enviar el token al frontend o almacenar en la sesión
    res.redirect(`http://127.0.0.1:5501/Frontend-P2-main/src/registroGoogle.html?token=${token}`);
  });
  

router.post("/", usuarioPost);
router.post("/obtener", authMiddleware, usuarioPostId); 
router.get("/", authMiddleware, usuarioGet);
router.put("/", authMiddleware, usuarioUpdate);
router.delete("/", authMiddleware, usuarioDelete);
router.post("/login", loginPost);
router.post("/validar-pin", authMiddleware,  validarPin)
router.get("/verify/:token", verifyUser); // Ruta para verificar la cuenta
router.post("/verify-code", authMiddleware, verifyCodePost);
router.post("/auth/google/callback", googleCallback);
router.post('/auth/google/token', googleTokenHandler);
router.post('/google/complete-google', completeGoogleRegistration);

module.exports = router;