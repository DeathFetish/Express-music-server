const Router = require("express");
const songController = require("../controllers/songController");
const authMiddleware = require("../middleware/authMiddleware");

const router = new Router();

router.post("/create", authMiddleware, songController.create);
router.get("/get/:id", songController.getOne);
router.delete('/delete/:id', authMiddleware, songController.delete);
router.put('/change/:id', authMiddleware, songController.change);

module.exports = router;