const express = require("express");
const router = express.Router();

const { 
    registroPost,
    registroGet 

} = require("../controllers/registroController");


router.post("/", registroPost);
router.get("/", registroGet);

module.exports = router;

