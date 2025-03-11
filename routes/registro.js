const express = require("express");
const router = express.Router();

const { 
    registroPost,
    registroGet,
    registroUpdate,
    registroDelete,
    loginPost

} = require("../controllers/usuariosController");


router.post("/", registroPost);
router.get("/", registroGet);
router.put("/", registroUpdate);
router.delete("/", registroDelete);
router.post("/", loginPost);

module.exports = router;